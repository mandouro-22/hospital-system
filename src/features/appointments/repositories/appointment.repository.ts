import { and, asc, count, desc, eq, gte, like, lte, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "@/db";
import {
  appointment,
  disabledAppointmentDate,
  doctor,
  patient,
  user,
} from "@/db/schema";
import type { PaginatedResult } from "@/features/auth/types/auth.types";
import type { AppointmentStatus } from "../types/appointment.types";
import type { AppointmentListInput, DisableAppointmentDateInput } from "../validations/appointment.schema";

const patientUser = alias(user, "patient_user");
const doctorUser = alias(user, "doctor_user");
const createdByUser = alias(user, "created_by_user");

export type AppointmentRecord = {
  id: string;
  patientId: string;
  patientName: string;
  patientNumber: string;
  doctorId: string;
  doctorName: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DisabledAppointmentDateRecord = {
  id: string;
  disabledDate: string;
  reason: string | null;
  createdBy: string | null;
  createdByName: string | null;
  createdAt: string;
};

export const AppointmentRepository = {
  async findAll(params: AppointmentListInput): Promise<PaginatedResult<AppointmentRecord>> {
    const { page, limit, search, status, dateFrom, dateTo } = params;
    const offset = (page - 1) * limit;
    const conditions: ReturnType<typeof sql>[] = [];

    if (search) {
      conditions.push(
        or(
          like(patientUser.name, `%${search}%`),
          like(doctorUser.name, `%${search}%`),
          like(patient.patientNumber, `%${search}%`),
          like(patient.phn, `%${search}%`),
        ) as ReturnType<typeof sql>,
      );
    }
    if (status) {
      conditions.push(eq(appointment.status, status) as ReturnType<typeof sql>);
    }
    if (dateFrom) {
      conditions.push(gte(appointment.scheduledDate, dateFrom) as ReturnType<typeof sql>);
    }
    if (dateTo) {
      conditions.push(lte(appointment.scheduledDate, dateTo) as ReturnType<typeof sql>);
    }

    const whereClause =
      conditions.length === 0
        ? undefined
        : conditions.length === 1
          ? conditions[0]
          : and(...conditions);

    const base = db
      .select({
        id: appointment.id,
        patientId: appointment.patientId,
        patientName: patientUser.name,
        patientNumber: patient.patientNumber,
        doctorId: appointment.doctorId,
        doctorName: doctorUser.name,
        scheduledDate: appointment.scheduledDate,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        status: appointment.status,
        notes: appointment.notes,
        createdAt: appointment.createdAt,
        updatedAt: appointment.updatedAt,
      })
      .from(appointment)
      .innerJoin(patient, eq(patient.id, appointment.patientId))
      .innerJoin(patientUser, eq(patientUser.id, patient.userId))
      .innerJoin(doctor, eq(doctor.id, appointment.doctorId))
      .innerJoin(doctorUser, eq(doctorUser.id, doctor.userId))
      .where(whereClause);

    const [totalResult] = await db.select({ value: count() }).from(base.as("t"));
    const total = totalResult?.value ?? 0;

    const rows = await base
      .orderBy(desc(appointment.scheduledDate), asc(appointment.startTime))
      .limit(limit)
      .offset(offset);

    return {
      data: rows.map((row) => ({
        ...row,
        status: row.status as AppointmentStatus,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async findDisabledDates(): Promise<DisabledAppointmentDateRecord[]> {
    const rows = await db
      .select({
        id: disabledAppointmentDate.id,
        disabledDate: disabledAppointmentDate.disabledDate,
        reason: disabledAppointmentDate.reason,
        createdBy: disabledAppointmentDate.createdBy,
        createdByName: createdByUser.name,
        createdAt: disabledAppointmentDate.createdAt,
      })
      .from(disabledAppointmentDate)
      .leftJoin(createdByUser, eq(createdByUser.id, disabledAppointmentDate.createdBy))
      .orderBy(asc(disabledAppointmentDate.disabledDate));

    return rows;
  },

  async findDisabledDateById(id: string): Promise<DisabledAppointmentDateRecord | null> {
    const [row] = await db
      .select({
        id: disabledAppointmentDate.id,
        disabledDate: disabledAppointmentDate.disabledDate,
        reason: disabledAppointmentDate.reason,
        createdBy: disabledAppointmentDate.createdBy,
        createdByName: createdByUser.name,
        createdAt: disabledAppointmentDate.createdAt,
      })
      .from(disabledAppointmentDate)
      .leftJoin(createdByUser, eq(createdByUser.id, disabledAppointmentDate.createdBy))
      .where(eq(disabledAppointmentDate.id, id))
      .limit(1);

    return row ?? null;
  },

  async findDisabledDateByDate(disabledDate: string) {
    const [row] = await db
      .select({ id: disabledAppointmentDate.id })
      .from(disabledAppointmentDate)
      .where(eq(disabledAppointmentDate.disabledDate, disabledDate))
      .limit(1);
    return row ?? null;
  },

  async createDisabledDate(
    input: DisableAppointmentDateInput,
    createdBy: string,
  ): Promise<DisabledAppointmentDateRecord> {
    const [created] = await db
      .insert(disabledAppointmentDate)
      .values({
        disabledDate: input.date,
        reason: input.reason ?? null,
        createdBy,
      })
      .returning({ id: disabledAppointmentDate.id });

    const record = await this.findDisabledDateById(created.id);
    if (!record) {
      throw new Error("Failed to load disabled appointment date");
    }
    return record;
  },

  async deleteDisabledDate(id: string): Promise<void> {
    await db.delete(disabledAppointmentDate).where(eq(disabledAppointmentDate.id, id));
  },
};
