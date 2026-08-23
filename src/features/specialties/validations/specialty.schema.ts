import { z } from "zod";

const STATUSES = ["active", "inactive"] as const;

export const specialtyListSchema = z.object({
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
      error: "Invalid specialty status",
    })
    .optional(),
});

export type SpecialtyListInput = z.infer<typeof specialtyListSchema>;

export const createSpecialtySchema = z.object({
  name: z
    .string({
      error: "Specialty name is required",
    })
    .trim()
    .min(2, {
      error: "Specialty name must be at least 2 characters",
    })
    .max(100, {
      error: "Specialty name cannot exceed 100 characters",
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

  status: z
    .enum(STATUSES, {
      error: "Invalid specialty status",
    })
    .default("active"),
});

export type CreateSpecialtyInput = z.infer<typeof createSpecialtySchema>;

export const updateSpecialtySchema = z
  .object({
    name: z
      .string({
        error: (issue) =>
          issue.input === undefined
            ? "Specialty name is required"
            : "Specialty name must be a text value",
      })
      .trim()
      .min(2, {
        error: "Specialty name must be at least 2 characters",
      })
      .max(100, {
        error: "Specialty name cannot exceed 100 characters",
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
        error: "Invalid specialty status",
      })
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    error: "At least one specialty field must be provided for update",
  });

export type UpdateSpecialtyInput = z.infer<typeof updateSpecialtySchema>;

export const specialtyIdParamSchema = z.object({
  id: z
    .string({
      error: "Specialty ID is required",
    })
    .min(1, { error: "Specialty ID is required" }),
});

export type SpecialtyIdParam = z.infer<typeof specialtyIdParamSchema>;