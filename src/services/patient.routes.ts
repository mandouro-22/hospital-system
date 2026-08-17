import { Hono } from "hono";
import { zodValidator } from "@/lib/zod-validator";
import {
  requireAdmin,
  requireAuth,
} from "@/features/auth/middleware/auth.middleware";
import { uuidParamSchema } from "@/features/auth/validations/params.schema";
import {
  patientListSchema,
  patientStatusSchema,
} from "@/features/patients/validations/patient.schema";
import {
  toPatientDetailDTO,
  toPatientListDTO,
} from "@/features/patients/dto/patient.dto";
import { PatientService } from "@/features/patients/services/patient.service";
import { paginated, success } from "@/lib/response";
import type { AuthVariables } from "@/features/auth/middleware/auth.middleware";

export const patientRoutes = new Hono<{ Variables: AuthVariables }>()
  .get(
    "/",
    requireAuth,
    requireAdmin,
    zodValidator("query", patientListSchema),
    async (c) => {
      const result = await PatientService.findAll(c.req.valid("query"));
      return paginated(c, result.data.map(toPatientListDTO), result.pagination);
    },
  )
  .get(
    "/:id",
    requireAuth,
    requireAdmin,
    zodValidator("param", uuidParamSchema),
    async (c) => {
      const patient = await PatientService.findById(c.req.valid("param").id);
      return success(c, toPatientDetailDTO(patient));
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