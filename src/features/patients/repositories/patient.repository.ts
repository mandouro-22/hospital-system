import { and, asc, count, eq, isNull, like, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { hashPassword } from "better-auth/crypto";
import { db } from "@/db";
import {
  account as accountTable,
  patient as patientTable,
  user as users,
} from "@/db/schema";
import type {
  UserStatus,
  PaginatedResult,
} from "@/features/auth/types/auth.types";
import type { PatientListInput } from "../validations/patient.schema";

export type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

export type PatientRecord = {
  id: string;
  userId: string;
  patientNumber: string;
  phn: string;
  phone: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  address: string | null;
  name: string;
  email: string;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  registeredByName: string | null;
};

type PatientRow = {
  patientId: string;
  patientUserId: string;
  patientNumber: string;
  phn: string;
  phone: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  address: string | null;
  userName: string;
  userEmail: string;
  userStatus: string;
  userCreatedAt: string;
  userUpdatedAt: string;
  registeredByName: string | null;
};

function toPatientRecord(row: PatientRow): PatientRecord {
  return {
    id: row.patientId,
    userId: row.patientUserId,
    patientNumber: row.patientNumber,
    phn: row.phn,
    phone: row.phone,
    gender: row.gender,
    dateOfBirth: row.dateOfBirth,
    address: row.address,
    name: row.userName,
    email: row.userEmail,
    status: row.userStatus as UserStatus,
    createdAt: row.userCreatedAt,
    updatedAt: row.userUpdatedAt,
    registeredByName: row.registeredByName,
  };
}

const creator = alias(users, "creator");

const baseColumns = {
  patientId: patientTable.id,
  patientUserId: patientTable.userId,
  patientNumber: patientTable.patientNumber,
  phn: patientTable.phn,
  phone: patientTable.phone,
  gender: patientTable.gender,
  dateOfBirth: patientTable.dateOfBirth,
  address: patientTable.address,
  userName: users.name,
  userEmail: users.email,
  userStatus: users.status,
  userCreatedAt: users.createdAt,
  userUpdatedAt: users.updatedAt,
  registeredByName: creator.name,
};

export const PatientRepository = {
  async findAll(
    params: PatientListInput,
  ): Promise<PaginatedResult<PatientRecord>> {
    const { page, limit, search, status } = params;
    const offset = (page - 1) * limit;

    const conditions: ReturnType<typeof sql>[] = [isNull(users.deletedAt)];

    if (search) {
      conditions.push(
        or(
          like(patientTable.patientNumber, `%${search}%`),
          like(users.name, `%${search}%`),
          like(users.email, `%${search}%`),
          like(patientTable.phone, `%${search}%`),
        ) as ReturnType<typeof sql>,
      );
    }
    if (status) {
      conditions.push(eq(users.status, status) as ReturnType<typeof sql>);
    }

    const whereClause =
      conditions.length === 1 ? conditions[0] : and(...conditions);

    const base = db
      .select(baseColumns)
      .from(patientTable)
      .innerJoin(users, eq(patientTable.userId, users.id))
      .leftJoin(creator, eq(users.createdBy, creator.id))
      .where(whereClause);

    const [totalResult] = await db.select({ value: count() }).from(base.as("t"));
    const total = totalResult?.value ?? 0;

    const rows = await base
      .orderBy(asc(patientTable.patientNumber))
      .limit(limit)
      .offset(offset);

    return {
      data: rows.map(toPatientRecord),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async findById(id: string): Promise<PatientRecord | null> {
    const rows = await db
      .select(baseColumns)
      .from(patientTable)
      .innerJoin(users, eq(patientTable.userId, users.id))
      .leftJoin(creator, eq(users.createdBy, creator.id))
      .where(and(eq(patientTable.id, id), isNull(users.deletedAt)))
      .limit(1);
    return rows.length > 0 ? toPatientRecord(rows[0]) : null;
  },

  async findByUserId(userId: string): Promise<PatientRecord | null> {
    const rows = await db
      .select(baseColumns)
      .from(patientTable)
      .innerJoin(users, eq(patientTable.userId, users.id))
      .leftJoin(creator, eq(users.createdBy, creator.id))
      .where(eq(patientTable.userId, userId))
      .limit(1);
    return rows.length > 0 ? toPatientRecord(rows[0]) : null;
  },

  async updateStatus(
    userId: string,
    status: "active" | "inactive",
  ): Promise<void> {
    await db
      .update(users)
      .set({ status, updatedAt: new Date().toISOString() })
      .where(eq(users.id, userId));
  },

  async findPatientByPHN(phn: string): Promise<{ id: string } | null> {
    const rows = await db
      .select({ id: patientTable.id })
      .from(patientTable)
      .where(eq(patientTable.phn, phn))
      .limit(1);
    return rows.length > 0 ? rows[0] : null;
  },

  async existsByPHN(phn: string): Promise<boolean> {
    return (await this.findPatientByPHN(phn)) !== null;
  },

  async createUser(
    data: {
      name: string;
      email: string;
      password: string;
      role: string;
      status: string;
      createdBy: string;
    },
    tx: Transaction,
  ): Promise<{ id: string }> {
    const hashedPassword = await hashPassword(data.password);

    const [createdUser] = await tx
      .insert(users)
      .values({
        name: data.name,
        email: data.email,
        role: data.role,
        status: data.status,
        createdBy: data.createdBy,
      })
      .returning({ id: users.id });

    if (!createdUser) {
      throw new Error("Failed to create patient user");
    }

    await tx.insert(accountTable).values({
      userId: createdUser.id,
      accountId: createdUser.id,
      providerId: "credential",
      password: hashedPassword,
      updatedAt: new Date().toISOString(),
    });

    return { id: createdUser.id };
  },

  async createPatient(
    data: {
      userId: string;
      phn: string;
      phone: string;
      gender: string | null;
      dateOfBirth: string | null;
      address: string;
    },
    tx: Transaction,
  ): Promise<{ id: string; patientNumber: string }> {
    const [createdPatient] = await tx
      .insert(patientTable)
      .values({
        userId: data.userId,
        phn: data.phn,
        phone: data.phone,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth,
        address: data.address,
      })
      .returning({
        id: patientTable.id,
        patientNumber: patientTable.patientNumber,
      });

    if (!createdPatient) {
      throw new Error("Failed to create patient profile");
    }

    return createdPatient;
  },
};