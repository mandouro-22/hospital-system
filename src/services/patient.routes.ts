import { Hono } from "hono";
import { zodValidator } from "@/lib/zod-validator";
import {
  requireAdmin,
  requireAuth,
  requireRole,
} from "@/features/auth/middleware/auth.middleware";
import { uuidParamSchema } from "@/features/auth/validations/params.schema";
import {
  createPatientSchema,
  patientListSchema,
  patientStatusSchema,
} from "@/features/patients/validations/patient.schema";
import {
  toPatientDetailDTO,
  toPatientListDTO,
} from "@/features/patients/dto/patient.dto";
import { PatientService } from "@/features/patients/services/patient.service";
import { created, paginated, success } from "@/lib/response";
import type { AuthVariables } from "@/features/auth/middleware/auth.middleware";

export const patientRoutes = new Hono<{ Variables: AuthVariables }>()
  .get(
    "/",
    requireAuth,
    requireRole("Admin", "Receptionist"),
    zodValidator("query", patientListSchema),
    async (c) => {
      const result = await PatientService.findAll(c.req.valid("query"));
      return paginated(c, result.data.map(toPatientListDTO), result.pagination);
    },
  )
  .get(
    "/:id",
    requireAuth,
    requireRole("Admin", "Receptionist"),
    zodValidator("param", uuidParamSchema),
    async (c) => {
      const patient = await PatientService.findById(c.req.valid("param").id);
      return success(c, toPatientDetailDTO(patient));
    },
  )
  .post(
    "/",
    requireAuth,
    requireRole("Admin", "Receptionist"),
    zodValidator("json", createPatientSchema),
    async (c) => {
      const patient = await PatientService.create(
        c.req.valid("json"),
        c.get("userId"),
      );
      return created(
        c,
        toPatientDetailDTO(patient),
        "Patient created successfully",
      );
    },
  )
  .patch(
    "/:id/status",
    requireAuth,
    requireAdmin,
    zodValidator("param", uuidParamSchema),
    zodValidator("json", patientStatusSchema),
    async (c) => {
      const patient = await PatientService.updateStatus(
        c.req.valid("param").id,
        c.req.valid("json"),
        c.get("userId"),
      );
      return success(
        c,
        toPatientDetailDTO(patient),
        "Patient status updated successfully",
      );
    },
  );