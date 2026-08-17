import { z } from "zod";

const STATUSES = [
  "active",
  "inactive",
  "locked",
  "suspended",
  "pending",
] as const;

export const patientListSchema = z.object({
  page: z.coerce
    .number({
      error: (issue) =>
        issue.input === undefined
          ? "Page is required"
          : "Page must be a number",
    })
    .int({ error: "Page must be a whole number" })
    .positive({ error: "Page must be greater than 0" })
    .default(1),

  limit: z.coerce
    .number({
      error: (issue) =>
        issue.input === undefined
          ? "Limit is required"
          : "Limit must be a number",
    })
    .int({ error: "Limit must be a whole number" })
    .positive({ error: "Limit must be greater than 0" })
    .max(100, { error: "Limit cannot exceed 100" })
    .default(20),

  search: z
    .string({
      error: "Search must be a text value",
    })
    .trim()
    .max(255, {
      error: "Search cannot exceed 255 characters",
    })
    .optional(),

  status: z
    .enum(STATUSES, {
      error: "Invalid patient status",
    })
    .optional(),
});

export type PatientListInput = z.infer<typeof patientListSchema>;

export const patientStatusSchema = z.object({
  status: z.enum(["active", "inactive"], {
    error: "Patient status must be active or inactive",
  }),
});

export type PatientStatusInput = z.infer<typeof patientStatusSchema>;