import { z } from "zod";
import { ROLES } from "../types/auth.types";

export const createUserSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name must be at most 255 characters"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address")
    .max(255, "Email must be at most 255 characters"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters"),
  role: z.enum(ROLES as [string, ...string[]]).default("Patient"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;