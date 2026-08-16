import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/db";
import { session } from "@/db/schema";

export const SessionRepository = {
  async findActiveByToken(token: string) {
    const rows = await db
      .select()
      .from(session)
      .where(and(eq(session.token, token), isNull(session.deletedAt)))
      .limit(1);
    return rows[0] ?? null;
  },

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
    return rows.length > 0 ? new Date(rows[0].createdAt) : null;
  },
}; 
