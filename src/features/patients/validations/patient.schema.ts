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

export const GENDERS = ["Male", "Female", "Other"] as const;

export const createPatientSchema = z.object({
  firstName: z
    .string({
      error: "First name is required",
    })
    .trim()
    .min(2, {
      error: "First name must be at least 2 characters",
    })
    .max(100, {
      error: "First name cannot exceed 100 characters",
    }),

  lastName: z
    .string({
      error: "Last name is required",
    })
    .trim()
    .min(2, {
      error: "Last name must be at least 2 characters",
    })
    .max(100, {
      error: "Last name cannot exceed 100 characters",
    }),

  email: z
    .string({
      error: "Email is required",
    })
    .trim()
    .toLowerCase()
    .email({
      error: "Please enter a valid email address",
    }),

  password: z
    .string({
      error: "Password is required",
    })
    .trim()
    .min(8, {
      error: "Password must be at least 8 characters",
    })
    .max(255, {
      error: "Password cannot exceed 255 characters",
    }),

  phn: z
    .string({
      error: "PHN is required",
    })
    .trim()
    .min(2, {
      error: "PHN must be at least 2 characters",
    })
    .max(50, {
      error: "PHN cannot exceed 50 characters",
    }),

  phone: z
    .string({
      error: "Phone number is required",
    })
    .trim()
    .min(7, {
      error: "Phone number must be at least 7 digits",
    })
    .max(20, {
      error: "Phone number cannot exceed 20 characters",
    }),

  gender: z
    .enum(GENDERS, {
      error: "Please select a valid gender",
    })
    .optional(),

  dateOfBirth: z
    .string({
      error: "Date of birth must be a valid date",
    })
    .optional()
    .refine(
      (value) => value === undefined || !Number.isNaN(Date.parse(value)),
      {
        message: "Date of birth must be a valid date",
      },
    )
    .refine(
      (value) =>
        value === undefined ||
        new Date(value).getTime() <= new Date().getTime(),
      {
        message: "Date of birth cannot be in the future",
      },
    ),

  address: z
    .string({
      error: "Address is required",
    })
    .trim()
    .min(5, {
      error: "Address must be at least 5 characters",
    })
    .max(500, {
      error: "Address cannot exceed 500 characters",
    }),
});

export type CreatePatientInput = z.infer<typeof createPatientSchema>;