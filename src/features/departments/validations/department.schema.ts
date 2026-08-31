import { z } from "zod";

export const STATUSES = ["active", "inactive"] as const;

export const departmentListSchema = z.object({
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
      error: "Invalid department status",
    })
    .optional(),
});

export type DepartmentListInput = z.infer<typeof departmentListSchema>;

export const createDepartmentSchema = z.object({
  name: z
    .string({
      error: "Department name is required",
    })
    .trim()
    .min(2, {
      error: "Department name must be at least 2 characters",
    })
    .max(100, {
      error: "Department name cannot exceed 100 characters",
    }),

  description: z
    .string({
      error: "Description must be a text value",
    })
    .trim()
    .max(1000, {
      error: "Description cannot exceed 1000 characters",
    })
    .optional()
    .nullable(),

  status: z.enum(STATUSES, {
    error: "Invalid department status",
  }),
});

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;

export const updateDepartmentSchema = z
  .object({
    name: z
      .string({
        error: (issue) =>
          issue.input === undefined
            ? "Department name is required"
            : "Department name must be a text value",
      })
      .trim()
      .min(2, {
        error: "Department name must be at least 2 characters",
      })
      .max(100, {
        error: "Department name cannot exceed 100 characters",
      })
      .optional(),

    description: z
      .string({
        error: "Description must be a text value",
      })
      .trim()
      .max(1000, {
        error: "Description cannot exceed 1000 characters",
      })
      .optional()
      .nullable(),

    status: z
      .enum(STATUSES, {
        error: "Invalid department status",
      })
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    error: "At least one department field must be provided for update",
  });

export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;

export const departmentIdParamSchema = z.object({
  id: z
    .string({
      error: "Department ID is required",
    })
    .min(1, { error: "Department ID is required" }),
});

export type DepartmentIdParam = z.infer<typeof departmentIdParamSchema>;

export const StatusValidation = z.object({
  status: z.enum(["active", "inactive"], { error: "status is required" }),
});
