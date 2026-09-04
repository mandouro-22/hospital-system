import { z } from "zod";
import { APPOINTMENT_STATUSES } from "@/features/appointment-settings/validations/appointment-settings.schema";

export const calendarDateSchema = z
  .string({ error: "Date is required" })
  .regex(/^\d{4}-\d{2}-\d{2}$/, { error: "Date must use YYYY-MM-DD format" });

export const appointmentListSchema = z.object({
  page: z.coerce
    .number({
      error: (issue) =>
        issue.input === undefined ? "Page is required" : "Page must be a number",
    })
    .int({ error: "Page must be a whole number" })
    .positive({ error: "Page must be greater than 0" })
    .default(1),
  limit: z.coerce
    .number({
      error: (issue) =>
        issue.input === undefined ? "Limit is required" : "Limit must be a number",
    })
    .int({ error: "Limit must be a whole number" })
    .positive({ error: "Limit must be greater than 0" })
    .max(100, { error: "Limit cannot exceed 100" })
    .default(20),
  search: z
    .string({ error: "Search must be a text value" })
    .trim()
    .max(255, { error: "Search cannot exceed 255 characters" })
    .optional(),
  status: z.enum(APPOINTMENT_STATUSES, { error: "Invalid appointment status" }).optional(),
  dateFrom: calendarDateSchema.optional(),
  dateTo: calendarDateSchema.optional(),
});

export type AppointmentListInput = z.infer<typeof appointmentListSchema>;

export const disableAppointmentDateSchema = z.object({
  date: calendarDateSchema,
  reason: z
    .string({ error: "Reason must be a text value" })
    .trim()
    .max(500, { error: "Reason cannot exceed 500 characters" })
    .optional()
    .nullable(),
});

export type DisableAppointmentDateInput = z.infer<typeof disableAppointmentDateSchema>;

export const disabledAppointmentDateIdParamSchema = z.object({
  id: z.string().uuid("Invalid UUID format"),
});
