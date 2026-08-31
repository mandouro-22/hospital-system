import { z } from "zod";
import { CONSULTATION_DURATIONS } from "@/features/auth/constants/staff-options";

export const APPOINTMENT_STATUSES = [
  "scheduled",
  "confirmed",
  "completed",
  "cancelled",
  "no_show",
] as const;

const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must use HH:mm format");

const workingHourSchema = z
  .object({
    dayOfWeek: z.number().int().min(0).max(6),
    isClosed: z.boolean(),
    startTime: timeSchema.nullable(),
    endTime: timeSchema.nullable(),
  })
  .superRefine((value, context) => {
    if (value.isClosed && (value.startTime !== null || value.endTime !== null)) {
      context.addIssue({ code: "custom", message: "Closed days cannot have working hours" });
    }
    if (!value.isClosed && (!value.startTime || !value.endTime)) {
      context.addIssue({ code: "custom", message: "Open days require start and end times" });
    }
    if (value.startTime && value.endTime && value.startTime >= value.endTime) {
      context.addIssue({ code: "custom", message: "End time must be later than start time" });
    }
  });

export const updateAppointmentSettingsSchema = z
  .object({
    defaultDuration: z.enum(CONSULTATION_DURATIONS),
    enabledStatuses: z.array(z.enum(APPOINTMENT_STATUSES)).min(2),
    cancellationNoticeHours: z.union([z.literal(0), z.literal(2), z.literal(4), z.literal(12), z.literal(24), z.literal(48)]),
    requireDoctorSchedule: z.boolean(),
    workingHours: z.array(workingHourSchema).length(7),
  })
  .superRefine((value, context) => {
    const days = new Set(value.workingHours.map((hour) => hour.dayOfWeek));
    if (days.size !== 7) {
      context.addIssue({ code: "custom", path: ["workingHours"], message: "Provide exactly one entry for each day of the week" });
    }
    if (!value.enabledStatuses.includes("scheduled") || !value.enabledStatuses.includes("cancelled")) {
      context.addIssue({ code: "custom", path: ["enabledStatuses"], message: "Scheduled and cancelled statuses are required" });
    }
  });

export type UpdateAppointmentSettingsInput = z.infer<typeof updateAppointmentSettingsSchema>;
