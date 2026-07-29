import { z } from "zod";
import { ROLES } from "../types/auth.types";

export const updateUserSchema = z.object({
  name: z
    .string()
    .min(1, "Name must not be empty")
    .max(255, "Name must be at most 255 characters")
    .optional(),
  role: z.enum(ROLES as [string, ...string[]]).optional(),
  image: z.string().nullable().optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field must be provided" },
);

export type UpdateUserInput = z.infer<typeof updateUserSchema>;