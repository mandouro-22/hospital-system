import { z } from "zod";
import { ROLES } from "../types/auth.types";

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().max(255).optional(),
  role: z.enum(ROLES as [string, ...string[]]).optional(),
  status: z.enum(["active", "inactive", "locked", "suspended"]).optional(),
  sortBy: z.string().max(50).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type PaginationInput = z.infer<typeof paginationSchema>;