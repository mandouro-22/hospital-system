import { z } from "zod";

const baseUserSchema = z.object({
  name: z.string().trim().min(2).max(200),
  email: z.string().trim().toLowerCase().email(),
  phone: z.string().trim().optional(),

  password: z.string().trim().max(255, ""),
});

export const createUserSchema = z.discriminatedUnion("role", [
  baseUserSchema.extend({
    role: z.literal("ADMIN"),
  }),

  baseUserSchema.extend({
    role: z.literal("RECEPTIONIST"),
    departmentId: z.string().uuid(),
    employeeCode: z.string().trim().min(2),
  }),

  baseUserSchema.extend({
    role: z.literal("DOCTOR"),
    departmentId: z.string().uuid(),
    employeeCode: z.string().trim().min(2),
    specialization: z.string().trim().min(2),
    licenseNumber: z.string().trim().min(2),
  }),
]);

export type CreateUserInput = z.infer<typeof createUserSchema>;
