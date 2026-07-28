import { pgEnum } from "drizzle-orm/pg-core/columns";

export const RoleEnum = pgEnum("role", [
  "Admin",
  "Doctor",
  "Receptionist",
  "Patient",
]);
