import { Hono } from "hono";
import { requireAdmin, requireAuth } from "@/features/auth/middleware/auth.middleware";
import type { AuthVariables } from "@/features/auth/middleware/auth.middleware";
import { DepartmentService } from "@/features/departments/services/department.service";
import { success } from "@/lib/response";

export const departmentRoutes = new Hono<{ Variables: AuthVariables }>().get(
  "/",
  requireAuth,
  requireAdmin,
  async (c) => success(c, await DepartmentService.findAll()),
);
