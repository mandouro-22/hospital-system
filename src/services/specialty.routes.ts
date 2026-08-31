import { Hono } from "hono";
import { zodValidator } from "@/lib/zod-validator";
import {
  requireAdmin,
  requireAuth,
} from "@/features/auth/middleware/auth.middleware";
import type { AuthVariables } from "@/features/auth/middleware/auth.middleware";
import {
  specialtyListSchema,
  createSpecialtySchema,
  updateSpecialtySchema,
  specialtyIdParamSchema,
} from "@/features/specialties/validations/specialty.schema";
import { SpecialtyService } from "@/features/specialties/services/specialty.service";
import {
  toSpecialtyListDTO,
  toSpecialtyDetailDTO,
} from "@/features/specialties/dto/specialty.dto";
import { paginated, success } from "@/lib/response";
import { StatusValidation } from "@/features/departments/validations/department.schema";

export const specialtyRoutes = new Hono<{ Variables: AuthVariables }>()
  .get(
    "/",
    requireAuth,
    requireAdmin,
    zodValidator("query", specialtyListSchema),
    async (c) => {
      const result = await SpecialtyService.findAll(c.req.valid("query"));
      return paginated(
        c,
        result.data.map(toSpecialtyListDTO),
        result.pagination,
      );
    },
  )
  .get("/active", requireAuth, requireAdmin, async (c) => {
    const specialties = await SpecialtyService.findAllActive();
    return success(c, specialties);
  })
  .post(
    "/",
    requireAuth,
    requireAdmin,
    zodValidator("json", createSpecialtySchema),
    async (c) => {
      const specialty = await SpecialtyService.create(c.req.valid("json"));
      return success(
        c,
        toSpecialtyDetailDTO(specialty),
        "Specialty created successfully",
        201,
      );
    },
  )
  .get(
    "/:id",
    requireAuth,
    requireAdmin,
    zodValidator("param", specialtyIdParamSchema),
    async (c) => {
      const specialty = await SpecialtyService.findById(
        c.req.valid("param").id,
      );
      return success(c, toSpecialtyDetailDTO(specialty));
    },
  )
  .patch(
    "/:id",
    requireAuth,
    requireAdmin,
    zodValidator("param", specialtyIdParamSchema),
    zodValidator("json", updateSpecialtySchema),
    async (c) => {
      const specialty = await SpecialtyService.update(
        c.req.valid("param").id,
        c.req.valid("json"),
      );
      return success(
        c,
        toSpecialtyDetailDTO(specialty),
        "Specialty updated successfully",
      );
    },
  )
  .patch(
    "/:id/status",
    requireAuth,
    requireAdmin,
    zodValidator("param", specialtyIdParamSchema),
    zodValidator("json", StatusValidation),
    async (c) => {
      const { status } = c.req.valid("json");
      const specialty = await SpecialtyService.updateStatus(
        c.req.valid("param").id,
        status,
      );
      return success(
        c,
        toSpecialtyDetailDTO(specialty),
        `Specialty ${status === "active" ? "activated" : "deactivated"} successfully`,
      );
    },
  )
  .delete(
    "/:id",
    requireAuth,
    requireAdmin,
    zodValidator("param", specialtyIdParamSchema),
    async (c) => {
      await SpecialtyService.delete(c.req.valid("param").id);
      return success(c, null, "Specialty deleted successfully");
    },
  );
