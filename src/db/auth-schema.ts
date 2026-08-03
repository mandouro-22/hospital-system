import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  uuid,
  timestamp,
  boolean,
  varchar,
  index,
  integer,
  char,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  role: varchar("role", { length: 50 }).notNull(),
  status: varchar("status", { length: 20 }).default("active").notNull(),
  lastLogin: timestamp("last_login", { withTimezone: true }),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const staff = pgTable("staff", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  employeeCode: varchar("employee_code", { length: 50 }).notNull().unique(),
  departmentId: varchar("department_id", { length: 50 }).notNull(),
  jobTitle: varchar("job_title", { length: 100 }).notNull(),
  hireDate: timestamp("hire_date", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const doctor = pgTable("doctor", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  specialization: varchar("specialization", { length: 100 }).notNull(),
  licenseNumber: varchar("license_number", { length: 50 }).notNull().unique(),
  consultationDuration: varchar("consultation_duration", { length: 20 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const department = pgTable("department", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  staff: many(staff),
  doctor: many(doctor),
}));

export const staffRelations = relations(staff, ({ one }) => ({
  user: one(users, {
    fields: [staff.userId],
    references: [users.id],
  }),
  department: one(department, {
    fields: [staff.departmentId],
    references: [department.id],
  }),
}));

export const doctorRelations = relations(doctor, ({ one }) => ({
  user: one(users, {
    fields: [doctor.userId],
    references: [users.id],
  }),
}));

export const departmentRelations = relations(department, ({ many }) => ({
  staff: many(staff),
}));
