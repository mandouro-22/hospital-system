import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq } from "drizzle-orm";
import { account } from "@/db/auth-schema";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

export const AccountRepository = {
  async findByUserId(userId: string) {
    const rows = await db
      .select()
      .from(account)
      .where(eq(account.userId, userId))
      .limit(1);
    return rows[0] ?? null;
  },

  async deleteByUserId(userId: string) {
    await db
      .delete(account)
      .where(eq(account.userId, userId));
  },
};