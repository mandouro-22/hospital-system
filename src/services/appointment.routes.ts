import { Hono } from "hono";
import { requireAdmin, requireAuth } from "@/features/auth/middleware/auth.middleware";
import type { AuthVariables } from "@/features/auth/middleware/auth.middleware";
import { zodValidator } from "@/lib/zod-validator";
import { paginated, success } from "@/lib/response";
import { AppointmentService } from "@/features/appointments/services/appointment.service";
import {
  appointmentListSchema,
  disableAppointmentDateSchema,
  disabledAppointmentDateIdParamSchema,
} from "@/features/appointments/validations/appointment.schema";
import {
  toAppointmentListDTO,
  toDisabledAppointmentDateDTO,
} from "@/features/appointments/dto/appointment.dto";

export const appointmentRoutes = new Hono<{ Variables: AuthVariables }>()
  .get(
    "/",
    requireAuth,
    requireAdmin,
    zodValidator("query", appointmentListSchema),
    async (c) => {
      const result = await AppointmentService.findAll(c.req.valid("query"));
      return paginated(c, result.data.map(toAppointmentListDTO), result.pagination);
    },
  )
  .get("/disabled-dates", requireAuth, requireAdmin, async (c) => {
    const dates = await AppointmentService.listDisabledDates();
    return success(c, dates.map(toDisabledAppointmentDateDTO));
  })
  .post(
    "/disabled-dates",
    requireAuth,
    requireAdmin,
    zodValidator("json", disableAppointmentDateSchema),
    async (c) => {
      const date = await AppointmentService.disableDate(c.req.valid("json"), c.get("userId"));
      return success(c, toDisabledAppointmentDateDTO(date), "Date disabled for appointments", 201);
    },
  )
  .delete(
    "/disabled-dates/:id",
    requireAuth,
    requireAdmin,
    zodValidator("param", disabledAppointmentDateIdParamSchema),
    async (c) => {
      await AppointmentService.enableDate(c.req.valid("param").id);
      return success(c, null, "Date enabled for appointments");
    },
  );
