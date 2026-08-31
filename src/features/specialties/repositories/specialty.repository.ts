import { and, count, eq, like, or, asc, sql } from "drizzle-orm";
import { db } from "@/db";
import { doctor, specialty } from "@/db/schema";
import type { PaginatedResult } from "@/features/auth/types/auth.types";
import type { SpecialtyListInput } from "../validations/specialty.schema";
import { SpecialtyStatus } from "../types/specialty.types";

export type SpecialtyRecord = {
  id: string;
  name: string;
  description: string | null;
  status: SpecialtyStatus;
  createdAt: string;
  updatedAt: string;
  doctorCount: number;
};

type SpecialtyRow = {
  specialtyId: string;
  specialtyName: string;
  specialtyDescription: string | null;
  specialtyStatus: string;
  specialtyCreatedAt: string;
  specialtyUpdatedAt: string;
  doctorCount: number;
};

function toSpecialtyRecord(row: SpecialtyRow): SpecialtyRecord {
  return {
    id: row.specialtyId,
    name: row.specialtyName,
    description: row.specialtyDescription,
    status: row.specialtyStatus as SpecialtyStatus,
    createdAt: row.specialtyCreatedAt,
    updatedAt: row.specialtyUpdatedAt,
    doctorCount: row.doctorCount,
  };
}

const baseColumns = {
  specialtyId: specialty.id,
  specialtyName: specialty.name,
  specialtyDescription: specialty.description,
  specialtyStatus: specialty.status,
  specialtyCreatedAt: specialty.createdAt,
  specialtyUpdatedAt: specialty.updatedAt,
};

export const SpecialtyRepository = {
  async findAll(
    params: SpecialtyListInput,
  ): Promise<PaginatedResult<SpecialtyRecord>> {
    const { page, limit, search, status } = params;
    const offset = (page - 1) * limit;

    const conditions: ReturnType<typeof sql>[] = [];

    if (search) {
      conditions.push(
        or(
          like(specialty.name, `%${search}%`),
          like(specialty.description, `%${search}%`),
        ) as ReturnType<typeof sql>,
      );
    }
    if (status) {
      conditions.push(eq(specialty.status, status) as ReturnType<typeof sql>);
    }

    const whereClause =
      conditions.length === 0
        ? undefined
        : conditions.length === 1
          ? conditions[0]
          : and(...conditions);

    const doctorCountSubquery = db
      .select({
        specialization: doctor.specialization,
        count: count().as("doctor_count"),
      })
      .from(doctor)
      .groupBy(doctor.specialization)
      .as("doctor_counts");

    const base = db
      .select({
        ...baseColumns,
        doctorCount: sql<number>`COALESCE(${doctorCountSubquery.count}, 0)`.as(
          "doctor_count",
        ),
      })
      .from(specialty)
      .leftJoin(
        doctorCountSubquery,
        eq(specialty.name, doctorCountSubquery.specialization),
      )
      .where(whereClause);

    const [totalResult] = await db
      .select({ value: count() })
      .from(base.as("t"));
    const total = totalResult?.value ?? 0;

    const rows = await base
      .orderBy(asc(specialty.name))
      .limit(limit)
      .offset(offset);

    return {
      data: rows.map(toSpecialtyRecord),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async findById(id: string): Promise<SpecialtyRecord | null> {
    const doctorCountSubquery = db
      .select({
        specialization: doctor.specialization,
        count: count().as("doctor_count"),
      })
      .from(doctor)
      .groupBy(doctor.specialization)
      .as("doctor_counts");

    const rows = await db
      .select({
        ...baseColumns,
        doctorCount: sql<number>`COALESCE(${doctorCountSubquery.count}, 0)`.as(
          "doctor_count",
        ),
      })
      .from(specialty)
      .leftJoin(
        doctorCountSubquery,
        eq(specialty.name, doctorCountSubquery.specialization),
      )
      .where(eq(specialty.id, id))
      .limit(1);

    return rows.length > 0 ? toSpecialtyRecord(rows[0]) : null;
  },

  async findAllActive(): Promise<{ id: string; name: string }[]> {
    return db
      .select({ id: specialty.id, name: specialty.name })
      .from(specialty)
      .where(eq(specialty.status, "active"))
      .orderBy(asc(specialty.name));
  },

  async create(data: {
    id: string;
    name: string;
    description: string | null;
    status: SpecialtyStatus;
  }): Promise<SpecialtyRecord> {
    const [created] = await db.insert(specialty).values(data).returning();

    return this.findById(created.id) as Promise<SpecialtyRecord>;
  },

  async update(
    id: string,
    data: {
      name?: string;
      description?: string | null;
      status?: SpecialtyStatus;
    },
  ): Promise<SpecialtyRecord | null> {
    const set: Record<string, unknown> = { updatedAt: new Date() };
    if (data.name !== undefined) set.name = data.name;
    if (data.description !== undefined) set.description = data.description;
    if (data.status !== undefined) set.status = data.status;

    await db.update(specialty).set(set).where(eq(specialty.id, id));

    return this.findById(id);
  },

  async updateStatus(
    id: string,
    status: SpecialtyStatus,
  ): Promise<SpecialtyRecord | null> {
    await db
      .update(specialty)
      .set({ status, updatedAt: new Date().toISOString() })
      .where(eq(specialty.id, id));

    return this.findById(id);
  },

  async delete(id: string): Promise<void> {
    await db.delete(specialty).where(eq(specialty.id, id));
  },

  async existsByName(name: string, excludeId?: string): Promise<boolean> {
    const conditions = [eq(specialty.name, name)];
    if (excludeId) {
      conditions.push(sql`${specialty.id} != ${excludeId}`);
    }
    const result = await db
      .select({ id: specialty.id })
      .from(specialty)
      .where(and(...conditions))
      .limit(1);
    return result.length > 0;
  },

  async hasActiveDoctors(id: string): Promise<boolean> {
    const specialtyRecord = await db
      .select({ name: specialty.name })
      .from(specialty)
      .where(eq(specialty.id, id))
      .limit(1);

    if (!specialtyRecord.length) return false;

    const result = await db
      .select({ count: count() })
      .from(doctor)
      .where(eq(doctor.specialization, specialtyRecord[0].name));
    return (result[0]?.count ?? 0) > 0;
  },
};
