import { and, count, eq, isNull, like, or, asc } from "drizzle-orm";
import { db } from "@/db";
import {
  receptionist as receptionistTable,
  user as users,
  staff,
  department,
} from "@/db/schema";
import type {
  UserStatus,
  PaginatedResult,
} from "@/features/auth/types/auth.types";
import type { ReceptionistListInput } from "../validations/receptionist.schema";
import type { ReceptionistRecord } from "../types/receptionist.types";

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
  receptionistId: receptionistTable.id,
  receptionistUserId: receptionistTable.userId,
  receptionistNumber: receptionistTable.receptionistNumber,
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

    const conditions: Array<ReturnType<typeof and>> = [isNull(users.deletedAt)];

    if (search) {
      conditions.push(
        or(
          like(receptionistTable.receptionistNumber, `%${search}%`),
          like(users.name, `%${search}%`),
          like(users.email, `%${search}%`),
        ) as ReturnType<typeof and>,
      );
    }
    if (status) {
      conditions.push(eq(users.status, status) as ReturnType<typeof and>);
    }

    const whereClause =
      conditions.length === 1 ? conditions[0] : and(...conditions);

    // const baseQuery = db
    //   .select(baseColumns)
    //   .from(receptionistTable)
    //   .innerJoin(users, eq(receptionistTable.userId, users.id))
    //   .leftJoin(staff, eq(staff.userId, users.id))
    //   .leftJoin(department, eq(department.id, staff.departmentId))
    //   .where(whereClause)
    //   .as("receptionist_base");

    // const [totalResult] = await db.select({ value: count() }).from(baseQuery);
    // const total = totalResult?.value ?? 0;

    const rows = await db
      .select(baseColumns)
      .from(receptionistTable)
      .innerJoin(users, eq(receptionistTable.userId, users.id))
      .leftJoin(staff, eq(staff.userId, users.id))
      .leftJoin(department, eq(department.id, staff.departmentId))
      .where(whereClause)
      .orderBy(asc(receptionistTable.receptionistNumber))
      .limit(limit)
      .offset(offset);

    return {
      data: rows.map(toReceptionistRecord),
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 1,
        // totalPages: Math.ceil(total / limit),
      },
    };
  },

  async findById(id: string): Promise<ReceptionistRecord | null> {
    const rows = await db
      .select(baseColumns)
      .from(receptionistTable)
      .innerJoin(users, eq(receptionistTable.userId, users.id))
      .leftJoin(staff, eq(staff.userId, users.id))
      .leftJoin(department, eq(department.id, staff.departmentId))
      .where(and(eq(receptionistTable.id, id), isNull(users.deletedAt)))
      .limit(1);
    return rows.length > 0 ? toReceptionistRecord(rows[0]) : null;
  },

  async findByUserId(userId: string): Promise<ReceptionistRecord | null> {
    const rows = await db
      .select(baseColumns)
      .from(receptionistTable)
      .innerJoin(users, eq(receptionistTable.userId, users.id))
      .leftJoin(staff, eq(staff.userId, users.id))
      .leftJoin(department, eq(department.id, staff.departmentId))
      .where(eq(receptionistTable.userId, userId))
      .limit(1);
    return rows.length > 0 ? toReceptionistRecord(rows[0]) : null;
  },

  async create(data: {
    id: string;
    userId: string;
  }): Promise<ReceptionistRecord> {
    const [insertReceptionist] = await db
      .insert(receptionistTable)
      .values({
        id: data.id,
        userId: data.userId,
      })
      .returning();

    const [userInfo] = await db
      .select({
        name: users.name,
        email: users.email,
        status: users.status,
        image: users.image,
        departmentId: department.id,
        departmentName: department.name,
        jobTitle: staff.jobTitle,
        employeeCode: staff.employeeCode,
      })
      .from(users)
      .where(and(eq(users.id, insertReceptionist.userId)))
      .leftJoin(staff, eq(staff.userId, users.id))
      .leftJoin(department, eq(department.id, staff.departmentId));

    const row: ReceptionistRow = {
      receptionistId: insertReceptionist.id,
      receptionistUserId: insertReceptionist.userId,
      receptionistNumber: insertReceptionist.receptionistNumber,
      userName: userInfo.name,
      userEmail: userInfo.email,
      userStatus: userInfo.status,
      userImage: userInfo.image,
      departmentId: userInfo.departmentId,
      departmentName: userInfo.departmentName,
      jobTitle: userInfo.jobTitle,
      employeeCode: userInfo.employeeCode,
    };

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
