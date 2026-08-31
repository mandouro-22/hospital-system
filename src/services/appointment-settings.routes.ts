import { Hono } from "hono";
import { requireAdmin, requireAuth } from "@/features/auth/middleware/auth.middleware";
import type { AuthVariables } from "@/features/auth/middleware/auth.middleware";
import { zodValidator } from "@/lib/zod-validator";
import { success } from "@/lib/response";
import { AppointmentSettingsService } from "@/features/appointment-settings/services/appointment-settings.service";
import { updateAppointmentSettingsSchema } from "@/features/appointment-settings/validations/appointment-settings.schema";

export const appointmentSettingsRoutes = new Hono<{ Variables: AuthVariables }>()
  .get("/", requireAuth, requireAdmin, async (c) => {
    return success(c, await AppointmentSettingsService.get());
  })
  .patch(
    "/",
    requireAuth,
    requireAdmin,
    zodValidator("json", updateAppointmentSettingsSchema),
    async (c) => {
      return success(
        c,
        await AppointmentSettingsService.update(c.req.valid("json")),
        "Appointment settings updated successfully",
      );
    },
  );
