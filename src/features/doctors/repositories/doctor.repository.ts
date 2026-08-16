import { and, count, eq, isNull, like, or, asc, sql } from "drizzle-orm";
import { db } from "@/db";
import { doctor, user as users, staff, department, doctorSchedule } from "@/db/schema";
import type { UserStatus, PaginatedResult } from "@/features/auth/types/auth.types";
import type { DoctorListInput } from "../validations/doctor.schema";
import type { DoctorScheduleDTO } from "../types/doctor.types";

export type DoctorRecord = {
  id: string;
  userId: string;
  doctorNumber: string;
  name: string;
  email: string;
  specialization: string;
  licenseNumber: string;
  consultationDuration: string;
  status: UserStatus;
  image: string | null;
  departmentId: string | null;
  departmentName: string | null;
  jobTitle: string | null;
  employeeCode: string | null;
};

type DoctorRow = {
  doctorId: string;
  doctorUserId: string;
  doctorNumber: string;
  specialization: string;
  licenseNumber: string;
  consultationDuration: string;
  userName: string;
  userEmail: string;
  userStatus: string;
  userImage: string | null;
  departmentId: string | null;
  departmentName: string | null;
  jobTitle: string | null;
  employeeCode: string | null;
};

function toDoctorRecord(row: DoctorRow): DoctorRecord {
  return {
    id: row.doctorId,
    userId: row.doctorUserId,
    doctorNumber: row.doctorNumber,
    specialization: row.specialization,
    licenseNumber: row.licenseNumber,
    consultationDuration: row.consultationDuration,
    name: row.userName,
    email: row.userEmail,
    status: row.userStatus as UserStatus,
    image: row.userImage,
    departmentId: row.departmentId,
    departmentName: row.departmentName,
    jobTitle: row.jobTitle,
    employeeCode: row.employeeCode,
  };
}

const baseColumns = {
  doctorId: doctor.id,
  doctorUserId: doctor.userId,
  doctorNumber: doctor.doctorNumber,
  specialization: doctor.specialization,
  licenseNumber: doctor.licenseNumber,
  consultationDuration: doctor.consultationDuration,
  userName: users.name,
  userEmail: users.email,
  userStatus: users.status,
  userImage: users.image,
  departmentId: department.id,
  departmentName: department.name,
  jobTitle: staff.jobTitle,
  employeeCode: staff.employeeCode,
};

export const DoctorRepository = {
  async findAll(params: DoctorListInput): Promise<PaginatedResult<DoctorRecord>> {
    const { page, limit, search, departmentId, specialization, status } = params;
    const offset = (page - 1) * limit;

    const conditions: ReturnType<typeof sql>[] = [isNull(users.deletedAt)];

    if (search) {
      conditions.push(
        or(
          like(doctor.doctorNumber, `%${search}%`),
          like(users.name, `%${search}%`),
          like(users.email, `%${search}%`),
        ) as ReturnType<typeof sql>,
      );
    }
    if (departmentId) {
      conditions.push(eq(department.id, departmentId) as ReturnType<typeof sql>);
    }
    if (specialization) {
      conditions.push(eq(doctor.specialization, specialization) as ReturnType<typeof sql>);
    }
    if (status) {
      conditions.push(eq(users.status, status) as ReturnType<typeof sql>);
    }

    const whereClause =
      conditions.length === 1 ? conditions[0] : and(...conditions);

    const base = db
      .select(baseColumns)
      .from(doctor)
      .innerJoin(users, eq(doctor.userId, users.id))
      .leftJoin(staff, eq(staff.userId, users.id))
      .leftJoin(department, eq(department.id, staff.departmentId))
      .where(whereClause);

    const [totalResult] = await db.select({ value: count() }).from(base.as("t"));
    const total = totalResult?.value ?? 0;

    const rows = await base
      .orderBy(asc(doctor.doctorNumber))
      .limit(limit)
      .offset(offset);

    return {
      data: rows.map(toDoctorRecord),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async findById(id: string): Promise<DoctorRecord | null> {
    const rows = await db
      .select(baseColumns)
      .from(doctor)
      .innerJoin(users, eq(doctor.userId, users.id))
      .leftJoin(staff, eq(staff.userId, users.id))
      .leftJoin(department, eq(department.id, staff.departmentId))
      .where(and(eq(doctor.id, id), isNull(users.deletedAt)))
      .limit(1);
    return rows.length > 0 ? toDoctorRecord(rows[0]) : null;
  },

  async findSchedule(doctorId: string): Promise<DoctorScheduleDTO[]> {
    return db
      .select({
        id: doctorSchedule.id,
        doctorId: doctorSchedule.doctorId,
        dayOfWeek: doctorSchedule.dayOfWeek,
        startTime: doctorSchedule.startTime,
        endTime: doctorSchedule.endTime,
      })
      .from(doctorSchedule)
      .where(eq(doctorSchedule.doctorId, doctorId))
      .orderBy(asc(doctorSchedule.dayOfWeek));
  },

  async update(
    id: string,
    data: {
      specialization?: string;
      licenseNumber?: string;
      consultationDuration?: string;
    },
  ): Promise<void> {
    const set: Record<string, unknown> = { updatedAt: new Date() };
    if (data.specialization !== undefined) set.specialization = data.specialization;
    if (data.licenseNumber !== undefined) set.licenseNumber = data.licenseNumber;
    if (data.consultationDuration !== undefined) {
      set.consultationDuration = data.consultationDuration;
    }
    await db.update(doctor).set(set).where(eq(doctor.id, id));
  },

  async updateDepartment(userId: string, departmentId: string): Promise<void> {
    await db
      .update(staff)
      .set({ departmentId, updatedAt: new Date().toISOString() })
      .where(eq(staff.userId, userId));
  },

  async updateUserName(userId: string, name: string): Promise<void> {
    await db
      .update(users)
      .set({ name, updatedAt: new Date().toISOString() })
      .where(eq(users.id, userId));
  },
};