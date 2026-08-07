import { Hono } from "hono";
import { zodValidator } from "@/lib/zod-validator";
import { requireAdmin, requireAuth } from "@/features/auth/middleware/auth.middleware";
import { uuidParamSchema } from "@/features/auth/validations/params.schema";
import {
  doctorListSchema,
  updateDoctorSchema,
} from "@/features/doctors/validations/doctor.schema";
import {
  toDoctorDetailDTO,
  toDoctorListDTO,
  toDoctorScheduleDTO,
} from "@/features/doctors/dto/doctor.dto";
import { DoctorService } from "@/features/doctors/services/doctor.service";
import { paginated, success } from "@/lib/response";
import type { AuthVariables } from "@/features/auth/middleware/auth.middleware";

export const doctorRoutes = new Hono<{ Variables: AuthVariables }>()
  .get(
    "/",
    requireAuth,
    requireAdmin,
    zodValidator("query", doctorListSchema),
    async (c) => {
      const result = await DoctorService.findAll(c.req.valid("query"));
      return paginated(c, result.data.map(toDoctorListDTO), result.pagination);
    },
  )
  .get(
    "/:id/schedule",
    requireAuth,
    requireAdmin,
    zodValidator("param", uuidParamSchema),
    async (c) => {
      const schedule = await DoctorService.findSchedule(
        c.req.valid("param").id,
      );
      return success(c, schedule.map(toDoctorScheduleDTO));
    },
  )
  .get(
    "/:id",
    requireAuth,
    requireAdmin,
    zodValidator("param", uuidParamSchema),
    async (c) => {
      const doctor = await DoctorService.findById(c.req.valid("param").id);
      return success(c, toDoctorDetailDTO(doctor));
    },
  )
  .patch(
    "/:id",
    requireAuth,
    requireAdmin,
    zodValidator("param", uuidParamSchema),
    zodValidator("json", updateDoctorSchema),
    async (c) => {
      const doctor = await DoctorService.update(
        c.req.valid("param").id,
        c.req.valid("json"),
      );
      return success(c, toDoctorDetailDTO(doctor), "Doctor updated successfully");
    },
  );