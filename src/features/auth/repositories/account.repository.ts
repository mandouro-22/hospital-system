import { eq } from "drizzle-orm";
import { db } from "@/db";
import { account } from "@/db/schema";

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
