import { Hono } from "hono";
import { zodValidator } from "@/lib/zod-validator";
import {
  requireAdmin,
  requireAuth,
} from "@/features/auth/middleware/auth.middleware";
import type { AuthVariables } from "@/features/auth/middleware/auth.middleware";
import {
  departmentListSchema,
  createDepartmentSchema,
  updateDepartmentSchema,
  departmentIdParamSchema,
  StatusValidation,
} from "@/features/departments/validations/department.schema";
import { DepartmentService } from "@/features/departments/services/department.service";
import {
  toDepartmentListDTO,
  toDepartmentDetailDTO,
} from "@/features/departments/dto/department.dto";
import { paginated, success } from "@/lib/response";
import z from "zod";

export const departmentRoutes = new Hono<{ Variables: AuthVariables }>()
  .get(
    "/",
    requireAuth,
    requireAdmin,
    zodValidator("query", departmentListSchema),
    async (c) => {
      const result = await DepartmentService.findAll(c.req.valid("query"));
      return paginated(
        c,
        result.data.map(toDepartmentListDTO),
        result.pagination,
      );
    },
  )
  .get("/active", requireAuth, requireAdmin, async (c) => {
    const departments = await DepartmentService.findAllActive();
    return success(c, departments);
  })
  .post(
    "/",
    requireAuth,
    requireAdmin,
    zodValidator("json", createDepartmentSchema),
    async (c) => {
      const department = await DepartmentService.create(c.req.valid("json"));
      return success(
        c,
        toDepartmentDetailDTO(department),
        "Department created successfully",
        201,
      );
    },
  )
  .get(
    "/:id",
    requireAuth,
    requireAdmin,
    zodValidator("param", departmentIdParamSchema),
    async (c) => {
      const department = await DepartmentService.findById(
        c.req.valid("param").id,
      );
      return success(c, toDepartmentDetailDTO(department));
    },
  )
  .patch(
    "/:id",
    requireAuth,
    requireAdmin,
    zodValidator("param", departmentIdParamSchema),
    zodValidator("json", updateDepartmentSchema),
    async (c) => {
      const department = await DepartmentService.update(
        c.req.valid("param").id,
        c.req.valid("json"),
      );
      return success(
        c,
        toDepartmentDetailDTO(department),
        "Department updated successfully",
      );
    },
  )
  .patch(
    "/:id/status",
    requireAuth,
    requireAdmin,
    zodValidator("param", departmentIdParamSchema),
    zodValidator("json", StatusValidation),
    async (c) => {
      const { status } = c.req.valid("json");
      const department = await DepartmentService.updateStatus(
        c.req.valid("param").id,
        status,
      );
      return success(
        c,
        toDepartmentDetailDTO(department),
        `Department ${status === "active" ? "activated" : "deactivated"} successfully`,
      );
    },
  )
  .delete(
    "/:id",
    requireAuth,
    requireAdmin,
    zodValidator("param", departmentIdParamSchema),
    async (c) => {
      await DepartmentService.delete(c.req.valid("param").id);
      return success(c, null, "Department deleted successfully");
    },
  );
