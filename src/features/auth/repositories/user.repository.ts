import { eq, ne, and, like, or, desc, asc, count, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/auth-schema";
import type { UserProfile, PaginatedResult, PaginationParams, Role } from "../types/auth.types";

function toProfile(u: typeof user.$inferSelect): UserProfile {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    emailVerified: u.emailVerified,
    image: u.image,
    role: u.role as Role,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
    deletedAt: u.deletedAt,
  };
}

export const UserRepository = {
  async findById(id: string): Promise<UserProfile | null> {
    const rows = await db
      .select()
      .from(user)
      .where(and(eq(user.id, id), isNull(user.deletedAt)))
      .limit(1);
    return rows.length > 0 ? toProfile(rows[0]) : null;
  },

  async findByIdIncludeDeleted(id: string): Promise<UserProfile | null> {
    const rows = await db
      .select()
      .from(user)
      .where(eq(user.id, id))
      .limit(1);
    return rows.length > 0 ? toProfile(rows[0]) : null;
  },

  async findByEmail(email: string): Promise<UserProfile | null> {
    const rows = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);
    return rows.length > 0 ? toProfile(rows[0]) : null;
  },

  async findAll(params: PaginationParams): Promise<PaginatedResult<UserProfile>> {
    const { page, limit, search, role: roleFilter, sortBy, sortOrder } = params;
    const offset = (page - 1) * limit;

    const conditions: ReturnType<typeof sql>[] = [isNull(user.deletedAt)];

    if (roleFilter) {
      conditions.push(eq(user.role, roleFilter));
    }

    if (search) {
      conditions.push(
        or(
          like(user.name, `%${search}%`),
          like(user.email, `%${search}%`),
        ) as ReturnType<typeof sql>,
      );
    }

    const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions);

    const [totalResult] = await db
      .select({ value: count() })
      .from(user)
      .where(whereClause);

    const total = totalResult?.value ?? 0;

    const orderByCol = sortBy === "email" ? user.email
      : sortBy === "name" ? user.name
      : sortBy === "role" ? user.role
      : user.createdAt;

    const orderByFn = sortOrder === "asc" ? asc : desc;

    const rows = await db
      .select()
      .from(user)
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

  async create(data: { id: string; name: string; email: string; role: string }): Promise<UserProfile> {
    const [row] = await db
      .insert(user)
      .values({
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
      })
      .returning();
    return toProfile(row);
  },

  async update(id: string, data: Partial<Pick<UserProfile, "name" | "role" | "image">>): Promise<UserProfile | null> {
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (data.name !== undefined) updateData.name = data.name;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.image !== undefined) updateData.image = data.image;

    const [row] = await db
      .update(user)
      .set(updateData)
      .where(eq(user.id, id))
      .returning();
    return row ? toProfile(row) : null;
  },

  async softDelete(id: string): Promise<void> {
    await db
      .update(user)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(user.id, id));
  },

  async emailExists(email: string, excludeId?: string): Promise<boolean> {
    const conditions: ReturnType<typeof sql>[] = [eq(user.email, email)];
    if (excludeId) {
      conditions.push(ne(user.id, excludeId));
    }
    const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions);
    const rows = await db
      .select({ id: user.id })
      .from(user)
      .where(whereClause)
      .limit(1);
    return rows.length > 0;
  },
};
