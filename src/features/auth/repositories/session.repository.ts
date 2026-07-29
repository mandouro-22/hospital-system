import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq, and, isNull } from "drizzle-orm";
import { session } from "@/db/auth-schema";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

export const SessionRepository = {
  async findActiveByUserId(userId: string) {
    const rows = await db
      .select()
      .from(session)
      .where(
        and(
          eq(session.userId, userId),
          isNull(session.deletedAt),
        ),
      )
      .limit(1);
    return rows[0] ?? null;
  },

  async getLastLogin(userId: string): Promise<Date | null> {
    const rows = await db
      .select()
      .from(session)
      .where(
        and(
          eq(session.userId, userId),
          isNull(session.deletedAt),
        ),
      )
      .orderBy(session.createdAt)
      .limit(1);
    return rows.length > 0 ? rows[0].createdAt : null;
  },
};