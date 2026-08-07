import { and, count, eq, isNull, like, or, asc, sql } from "drizzle-orm";
import { db } from "@/db";
import { receptionist, users, staff, department } from "@/db/auth-schema";
import type {
  UserStatus,
  PaginatedResult,
} from "@/features/auth/types/auth.types";
import type { ReceptionistListInput } from "../validations/receptionist.schema";

export type ReceptionistRecord = {
  id: string;
  userId: string;
  receptionistNumber: string;
  name: string;
  email: string;
  status: UserStatus;
  image: string | null;
  departmentId: string | null;
  departmentName: string | null;
  jobTitle: string | null;
  employeeCode: string | null;
};

type ReceptionistRow = {
  receptionistId: string;
  receptionistUserId: string;
  receptionistNumber: string;
  userName: string;
  userEmail: string;
  userStatus: string;
  userImage: string | null;
  departmentId: string | null;
  departmentName: string | null;
  jobTitle: string | null;
  employeeCode: string | null;
};

function toReceptionistRecord(row: ReceptionistRow): ReceptionistRecord {
  return {
    id: row.receptionistId,
    userId: row.receptionistUserId,
    receptionistNumber: row.receptionistNumber,
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
  receptionistId: receptionist.id,
  receptionistUserId: receptionist.userId,
  receptionistNumber: receptionist.receptionistNumber,
  userName: users.name,
  userEmail: users.email,
  userStatus: users.status,
  userImage: users.image,
  departmentId: department.id,
  departmentName: department.name,
  jobTitle: staff.jobTitle,
  employeeCode: staff.employeeCode,
};

export const ReceptionistRepository = {
  async findAll(
    params: ReceptionistListInput,
  ): Promise<PaginatedResult<ReceptionistRecord>> {
    const { page, limit, search, status } = params;
    const offset = (page - 1) * limit;

    const conditions: ReturnType<typeof sql>[] = [isNull(users.deletedAt)];

    if (search) {
      conditions.push(
        or(
          like(receptionist.receptionistNumber, `%${search}%`),
          like(users.name, `%${search}%`),
          like(users.email, `%${search}%`),
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
      .from(receptionist)
      .innerJoin(users, eq(receptionist.userId, users.id))
      .leftJoin(staff, eq(staff.userId, users.id))
      .leftJoin(department, eq(department.id, staff.departmentId))
      .where(whereClause);

    const baseReceptionist = base.as("t");

    const [totalResult] = await db
      .select({ value: count() })
      .from(baseReceptionist);
    const total = totalResult?.value ?? 0;
    const rows = await base
      .orderBy(asc(receptionist.receptionistNumber))
      .limit(limit)
      .offset(offset);

    return {
      data: rows.map(toReceptionistRecord),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async findById(id: string): Promise<ReceptionistRecord | null> {
    const rows = await db
      .select(baseColumns)
      .from(receptionist)
      .innerJoin(users, eq(receptionist.userId, users.id))
      .leftJoin(staff, eq(staff.userId, users.id))
      .leftJoin(department, eq(department.id, staff.departmentId))
      .where(and(eq(receptionist.id, id), isNull(users.deletedAt)))
      .limit(1);
    return rows.length > 0 ? toReceptionistRecord(rows[0]) : null;
  },

  async findByUserId(userId: string): Promise<ReceptionistRecord | null> {
    const rows = await db
      .select(baseColumns)
      .from(receptionist)
      .innerJoin(users, eq(receptionist.userId, users.id))
      .leftJoin(staff, eq(staff.userId, users.id))
      .leftJoin(department, eq(department.id, staff.departmentId))
      .where(eq(receptionist.userId, userId))
      .limit(1);
    return rows.length > 0 ? toReceptionistRecord(rows[0]) : null;
  },

  async create(data: {
    id: string;
    userId: string;
  }): Promise<ReceptionistRecord> {
    const [row] = await db
      .insert(receptionist)
      .values({
        id: data.id,
        userId: data.userId,
      })
      .returning();

    return toReceptionistRecord(row);
  },

  async update(
    id: string,
    data: {
      name?: string;
    },
  ): Promise<void> {
    const set: Record<string, unknown> = { updatedAt: new Date() };
    if (data.name !== undefined) set.name = data.name;
    await db.update(users).set(set).where(eq(users.id, id));
  },
};
