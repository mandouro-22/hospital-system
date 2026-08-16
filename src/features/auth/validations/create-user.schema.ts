import { z } from "zod";
import {
  CONSULTATION_DURATIONS,
  JOB_TITLES,
  RECEPTIONIST_JOB_TITLES,
  SPECIALIZATIONS,
} from "../constants/staff-options";

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
    departmentId: z.string().uuid(),
    employeeCode: z.string().trim().min(2).max(50),
    jobTitle: z.enum(RECEPTIONIST_JOB_TITLES),
    hireDate: z.coerce.date(),
  }),

  baseUserSchema.extend({
    role: z.literal("Doctor"),
    departmentId: z.string().uuid(),
    employeeCode: z.string().trim().min(2).max(50),
    jobTitle: z.enum(JOB_TITLES),
    hireDate: z.coerce.date(),
    specialization: z.enum(SPECIALIZATIONS),
    licenseNumber: z.string().trim().min(2).max(50),
    consultationDuration: z.enum(CONSULTATION_DURATIONS),
  }),
]);

export type CreateUserInput = z.infer<typeof createUserSchema>;
