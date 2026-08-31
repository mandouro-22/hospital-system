import { and, count, eq, isNull, like, or, asc, sql } from "drizzle-orm";
import { db } from "@/db";
import { department, staff } from "@/db/schema";
import type { PaginatedResult } from "@/features/auth/types/auth.types";
import type { DepartmentListInput } from "../validations/department.schema";
import { DepartmentStatus } from "../types/department.types";

export type DepartmentRecord = {
  id: string;
  name: string;
  description: string | null;
  status: DepartmentStatus;
  createdAt: string;
  updatedAt: string;
  doctorCount: number;
};

type DepartmentRow = {
  departmentId: string;
  departmentName: string;
  departmentDescription: string | null;
  departmentStatus: string;
  departmentCreatedAt: string;
  departmentUpdatedAt: string;
  doctorCount: number;
};

function toDepartmentRecord(row: DepartmentRow): DepartmentRecord {
  return {
    id: row.departmentId,
    name: row.departmentName,
    description: row.departmentDescription,
    status: row.departmentStatus as DepartmentStatus,
    createdAt: row.departmentCreatedAt,
    updatedAt: row.departmentUpdatedAt,
    doctorCount: row.doctorCount,
  };
}

const baseColumns = {
  departmentId: department.id,
  departmentName: department.name,
  departmentDescription: department.description,
  departmentStatus: department.status,
  departmentCreatedAt: department.createdAt,
  departmentUpdatedAt: department.updatedAt,
};

export const DepartmentRepository = {
  async findAll(
    params: DepartmentListInput,
  ): Promise<PaginatedResult<DepartmentRecord>> {
    const { page, limit, search, status } = params;
    const offset = (page - 1) * limit;

    const conditions: ReturnType<typeof sql>[] = [];

    if (search) {
      conditions.push(
        or(
          like(department.name, `%${search}%`),
          like(department.description, `%${search}%`),
        ) as ReturnType<typeof sql>,
      );
    }
    if (status) {
      conditions.push(eq(department.status, status) as ReturnType<typeof sql>);
    }

    const whereClause =
      conditions.length === 0
        ? undefined
        : conditions.length === 1
          ? conditions[0]
          : and(...conditions);

    const doctorCountSubquery = db
      .select({
        departmentId: staff.departmentId,
        count: count().as("doctor_count"),
      })
      .from(staff)
      .innerJoin(department, eq(department.id, staff.departmentId))
      .where(isNull(staff.userId))
      .groupBy(staff.departmentId)
      .as("doctor_counts");

    const base = db
      .select({
        ...baseColumns,
        doctorCount: sql<number>`COALESCE(${doctorCountSubquery.count}, 0)`.as(
          "doctor_count",
        ),
      })
      .from(department)
      .leftJoin(
        doctorCountSubquery,
        eq(department.id, doctorCountSubquery.departmentId),
      )
      .where(whereClause);

    const [totalResult] = await db
      .select({ value: count() })
      .from(base.as("t"));
    const total = totalResult?.value ?? 0;

    const rows = await base
      .orderBy(asc(department.name))
      .limit(limit)
      .offset(offset);

    return {
      data: rows.map(toDepartmentRecord),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async findById(id: string): Promise<DepartmentRecord | null> {
    const doctorCountSubquery = db
      .select({
        departmentId: staff.departmentId,
        count: count().as("doctor_count"),
      })
      .from(staff)
      .innerJoin(department, eq(department.id, staff.departmentId))
      .where(isNull(staff.userId))
      .groupBy(staff.departmentId)
      .as("doctor_counts");

    const rows = await db
      .select({
        ...baseColumns,
        doctorCount: sql<number>`COALESCE(${doctorCountSubquery.count}, 0)`,
      })
      .from(department)
      .leftJoin(
        doctorCountSubquery,
        eq(department.id, doctorCountSubquery.departmentId),
      )
      .where(eq(department.id, id))
      .limit(1);

    return rows.length > 0 ? toDepartmentRecord(rows[0]) : null;
  },

  async findAllActive(): Promise<{ id: string; name: string }[]> {
    return db
      .select({ id: department.id, name: department.name })
      .from(department)
      .where(eq(department.status, "active"))
      .orderBy(asc(department.name));
  },

  async create(data: {
    id: string;
    name: string;
    description: string | null;
    status: DepartmentStatus;
  }): Promise<DepartmentRecord> {
    const [created] = await db.insert(department).values(data).returning();

    return this.findById(created.id) as Promise<DepartmentRecord>;
  },

  async update(
    id: string,
    data: {
      name?: string;
      description?: string | null;
      status?: DepartmentStatus;
    },
  ): Promise<DepartmentRecord | null> {
    const set: Record<string, unknown> = { updatedAt: new Date() };
    if (data.name !== undefined) set.name = data.name;
    if (data.description !== undefined) set.description = data.description;
    if (data.status !== undefined) set.status = data.status;

    await db.update(department).set(set).where(eq(department.id, id));

    return this.findById(id);
  },

  async updateStatus(
    id: string,
    status: DepartmentStatus,
  ): Promise<DepartmentRecord | null> {
    await db
      .update(department)
      .set({ status, updatedAt: new Date().toISOString() })
      .where(eq(department.id, id));

    return this.findById(id);
  },

  async delete(id: string): Promise<void> {
    await db.delete(department).where(eq(department.id, id));
  },

  async existsByName(name: string, excludeId?: string): Promise<boolean> {
    const conditions = [eq(department.name, name)];
    if (excludeId) {
      conditions.push(sql`${department.id} != ${excludeId}`);
    }
    const result = await db
      .select({ id: department.id })
      .from(department)
      .where(and(...conditions))
      .limit(1);
    return result.length > 0;
  },

  async hasActiveDoctors(id: string): Promise<boolean> {
    const result = await db
      .select({ count: count() })
      .from(staff)
      .innerJoin(department, eq(department.id, staff.departmentId))
      .where(and(eq(staff.departmentId, id), isNull(staff.userId)));
    return (result[0]?.count ?? 0) > 0;
  },
};
