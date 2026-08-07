import { z } from "zod";

const STATUSES = [
  "active",
  "inactive",
  "locked",
  "suspended",
  "pending",
] as const;

export const receptionistListSchema = z.object({
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
      error: "Invalid receptionist status",
    })
    .optional(),
});

export type ReceptionistListInput = z.infer<typeof receptionistListSchema>;

export const updateReceptionistSchema = z
  .object({
    name: z
      .string({
        error: (issue) =>
          issue.input === undefined
            ? "Receptionist name is required"
            : "Receptionist name must be a text value",
      })
      .trim()
      .min(2, {
        error: "Receptionist name must be at least 2 characters",
      })
      .max(200, {
        error: "Receptionist name cannot exceed 200 characters",
      })
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    error: "At least one receptionist field must be provided for update",
  });

export type UpdateReceptionistInput = z.infer<typeof updateReceptionistSchema>;

export const createReceptionistSchema = z.object({
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

  jobTitle: z.enum(
    [
      "Receptionist",
      "Senior Receptionist",
      "Front Desk Supervisor",
      "Patient Coordinator",
      "Appointment Scheduler",
    ] as const,
    {
      error: "Please select a job title",
    },
  ),

  hireDate: z.string({
    error: "Hire date is required",
  }),
});

export type createReceptionistValues = z.infer<typeof createReceptionistSchema>;
