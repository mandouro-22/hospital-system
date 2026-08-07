import {
  eq,
  ne,
  and,
  like,
  or,
  desc,
  asc,
  count,
  isNull,
  sql,
  inArray,
} from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/auth-schema";
import type {
  UserProfile,
  PaginatedResult,
  PaginationParams,
  Role,
  UserStatus,
} from "../types/auth.types";

function toProfile(u: typeof users.$inferSelect): UserProfile {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    emailVerified: u.emailVerified,
    image: u.image,
    role: u.role as Role,
    status: u.status as UserStatus,
    lastLogin: u.lastLogin,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
    deletedAt: u.deletedAt,
  };
}

export const UserRepository = {
  async findById(id: string): Promise<UserProfile | null> {
    const rows = await db
      .select()
      .from(users)
      .where(and(eq(users.id, id), isNull(users.deletedAt)))
      .limit(1);
    return rows.length > 0 ? toProfile(rows[0]) : null;
  },

  async findByIdIncludeDeleted(id: string): Promise<UserProfile | null> {
    const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return rows.length > 0 ? toProfile(rows[0]) : null;
  },

  async findByEmail(email: string): Promise<UserProfile | null> {
    const rows = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return rows.length > 0 ? toProfile(rows[0]) : null;
  },

  async findAll(
    params: PaginationParams,
  ): Promise<PaginatedResult<UserProfile>> {
    const { page, limit, search, role: roleFilter, sortBy, sortOrder } = params;
    const offset = (page - 1) * limit;

    const conditions: ReturnType<typeof sql>[] = [isNull(users.deletedAt)];

    if (roleFilter) {
      conditions.push(eq(users.role, roleFilter));
    }

    if (search) {
      conditions.push(
        or(
          like(users.name, `%${search}%`),
          like(users.email, `%${search}%`),
        ) as ReturnType<typeof sql>,
      );
    }

    const whereClause =
      conditions.length === 1 ? conditions[0] : and(...conditions);

    const [totalResult] = await db
      .select({ value: count() })
      .from(users)
      .where(whereClause);

    const total = totalResult?.value ?? 0;

    const orderByCol =
      sortBy === "email"
        ? users.email
        : sortBy === "name"
          ? users.name
          : sortBy === "role"
            ? users.role
            : users.createdAt;

    const orderByFn = sortOrder === "asc" ? asc : desc;

    const rows = await db
      .select()
      .from(users)
      .where(whereClause)
      .orderBy(orderByFn(orderByCol))
      .limit(limit)
      .offset(offset);

    return {
      data: rows.map(toProfile),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async create(data: {
    id: string;
    name: string;
    email: string;
    role: string;
  }): Promise<UserProfile> {
    const [row] = await db
      .insert(users)
      .values({
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
      })
      .returning();
    return toProfile(row);
  },

  async update(
    id: string,
    data: Partial<
      Pick<UserProfile, "name" | "role" | "image" | "status" | "lastLogin">
    >,
  ): Promise<UserProfile | null> {
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (data.name !== undefined) updateData.name = data.name;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.image !== undefined) updateData.image = data.image;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.lastLogin !== undefined) updateData.lastLogin = data.lastLogin;

    const [row] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    return row ? toProfile(row) : null;
  },

  async softDelete(id: string): Promise<void> {
    await db
      .update(users)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(users.id, id));
  },

  async emailExists(email: string, excludeId?: string): Promise<boolean> {
    const conditions: ReturnType<typeof sql>[] = [eq(users.email, email)];
    if (excludeId) {
      conditions.push(ne(users.id, excludeId));
    }
    const whereClause =
      conditions.length === 1 ? conditions[0] : and(...conditions);
    const rows = await db
      .select({ id: users.id })
      .from(users)
      .where(whereClause)
      .limit(1);
    return rows.length > 0;
  },
};
