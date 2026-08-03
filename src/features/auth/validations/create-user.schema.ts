import { z } from "zod";

const baseUserSchema = z.object({
  name: z.string().trim().min(2).max(200),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().trim().min(8).max(255),
});

export const createUserSchema = z.discriminatedUnion("role", [
  baseUserSchema.extend({
    role: z.literal("Admin"),
  }),

  baseUserSchema.extend({
    role: z.literal("Receptionist"),
    departmentId: z.string().trim().min(1),
    employeeCode: z.string().trim().min(2).max(50),
    jobTitle: z.string().trim().min(2).max(100),
    hireDate: z.coerce.date(),
  }),

  baseUserSchema.extend({
    role: z.literal("Doctor"),
    departmentId: z.string().trim().min(1),
    employeeCode: z.string().trim().min(2).max(50),
    jobTitle: z.string().trim().min(2).max(100),
    hireDate: z.coerce.date(),
    specialization: z.string().trim().min(2).max(100),
    licenseNumber: z.string().trim().min(2).max(50),
    consultationDuration: z.string().trim().min(1).max(20),
  }),
]);

export type CreateUserInput = z.infer<typeof createUserSchema>;
