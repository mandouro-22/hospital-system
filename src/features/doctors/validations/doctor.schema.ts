import { z } from "zod";
import {
  CONSULTATION_DURATIONS,
  JOB_TITLES,
  SPECIALIZATIONS,
} from "@/features/auth/constants/staff-options";

const STATUSES = [
  "active",
  "inactive",
  "locked",
  "suspended",
  "pending",
] as const;

export const doctorListSchema = z.object({
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

  departmentId: z
    .string({
      error: "Department ID must be a valid string",
    })
    .uuid({
      error: "Department ID must be a valid UUID",
    })
    .optional(),

  specialization: z
    .enum(SPECIALIZATIONS, {
      error: "Invalid doctor specialization",
    })
    .optional(),

  status: z
    .enum(STATUSES, {
      error: "Invalid doctor status",
    })
    .optional(),
});

export type DoctorListInput = z.infer<typeof doctorListSchema>;

export const updateDoctorSchema = z
  .object({
    name: z
      .string({
        error: (issue) =>
          issue.input === undefined
            ? "Doctor name is required"
            : "Doctor name must be a text value",
      })
      .trim()
      .min(2, {
        error: "Doctor name must be at least 2 characters",
      })
      .max(200, {
        error: "Doctor name cannot exceed 200 characters",
      })
      .optional(),

    departmentId: z
      .string({
        error: "Department ID must be a valid string",
      })
      .uuid({
        error: "Department ID must be a valid UUID",
      })
      .optional(),

    specialization: z
      .enum(SPECIALIZATIONS, {
        error: "Invalid doctor specialization",
      })
      .optional(),

    licenseNumber: z
      .string({
        error: (issue) =>
          issue.input === undefined
            ? "License number is required"
            : "License number must be a text value",
      })
      .trim()
      .min(2, {
        error: "License number must be at least 2 characters",
      })
      .max(50, {
        error: "License number cannot exceed 50 characters",
      })
      .optional(),

    consultationDuration: z
      .enum(CONSULTATION_DURATIONS, {
        error: "Invalid consultation duration",
      })
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    error: "At least one doctor field must be provided for update",
  });

export type UpdateDoctorInput = z.infer<typeof updateDoctorSchema>;

export const createDoctorSchema = z.object({
  name: z
    .string({
      error: "Full name is required",
    })
    .trim()
    .min(2, {
      error: "Full name must be at least 2 characters",
    })
    .max(200, {
      error: "Full name cannot exceed 200 characters",
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

  departmentId: z
    .string({
      error: "Please select a department",
    })
    .uuid({
      error: "Please select a valid department",
    }),

  employeeCode: z
    .string({
      error: "Employee code is required",
    })
    .trim()
    .min(2, {
      error: "Employee code must be at least 2 characters",
    })
    .max(50, {
      error: "Employee code cannot exceed 50 characters",
    }),

  jobTitle: z.enum(JOB_TITLES, {
    error: "Please select a job title",
  }),

  hireDate: z.string({
    error: "Hire date is required",
  }),

  specialization: z.enum(SPECIALIZATIONS, {
    error: "Please select a specialization",
  }),

  licenseNumber: z
    .string({
      error: "License number is required",
    })
    .trim()
    .min(2, {
      error: "License number must be at least 2 characters",
    })
    .max(50, {
      error: "License number cannot exceed 50 characters",
    }),

  consultationDuration: z.enum(CONSULTATION_DURATIONS, {
    error: "Please select a consultation duration",
  }),
});

export type createDoctorValues = z.infer<typeof createDoctorSchema>;
