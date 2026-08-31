import { pgTable, uuid, integer, varchar, timestamp, index, text, foreignKey, unique, boolean, uniqueIndex, pgSequence } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"


export const doctorNumberSeq = pgSequence("doctor_number_seq", {  startWith: "1", increment: "1", minValue: "1", maxValue: "9223372036854775807", cache: "1", cycle: false })
export const receptionistNumberSeq = pgSequence("receptionist_number_seq", {  startWith: "1", increment: "1", minValue: "1", maxValue: "9223372036854775807", cache: "1", cycle: false })
export const patientNumberSeq = pgSequence("patient_number_seq", {  startWith: "1", increment: "1", minValue: "1", maxValue: "9223372036854775807", cache: "1", cycle: false })

export const doctorSchedule = pgTable("doctor_schedule", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	doctorId: uuid("doctor_id").notNull(),
	dayOfWeek: integer("day_of_week").notNull(),
	startTime: varchar("start_time", { length: 5 }).notNull(),
	endTime: varchar("end_time", { length: 5 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const appointmentConfiguration = pgTable("appointment_configuration", {
	id: varchar({ length: 50 }).primaryKey().notNull(),
	defaultDuration: varchar("default_duration", { length: 20 }).default('30 min').notNull(),
	enabledStatuses: text("enabled_statuses").array().default(sql`ARRAY['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show']::text[]`).notNull(),
	cancellationNoticeHours: integer("cancellation_notice_hours").default(24).notNull(),
	requireDoctorSchedule: boolean("require_doctor_schedule").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const hospitalWorkingHours = pgTable("hospital_working_hours", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	dayOfWeek: integer("day_of_week").notNull(),
	isClosed: boolean("is_closed").default(false).notNull(),
	startTime: varchar("start_time", { length: 5 }),
	endTime: varchar("end_time", { length: 5 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("hospital_working_hours_day_of_week_unique").on(table.dayOfWeek),
]);

export const verification = pgTable("verification", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("verification_identifier_idx").using("btree", table.identifier.asc().nullsLast().op("text_ops")),
]);

export const account = pgTable("account", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: uuid("user_id").notNull(),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true, mode: 'string' }),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true, mode: 'string' }),
	scope: text(),
	password: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("account_userId_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "account_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const session = pgTable("session", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }).notNull(),
	token: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: uuid("user_id").notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("session_userId_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "session_user_id_user_id_fk"
		}).onDelete("cascade"),
	unique("session_token_unique").on(table.token),
]);

export const department = pgTable("department", {
	id: varchar({ length: 50 }).primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	description: text(),
	status: varchar({ length: 20 }).default('active').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("department_name_unique").on(table.name),
]);

export const specialty = pgTable("specialty", {
	id: varchar({ length: 50 }).primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	description: text(),
	status: varchar({ length: 20 }).default('active').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("specialty_name_unique").on(table.name),
]);

export const user = pgTable("user", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text(),
	role: varchar({ length: 50 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	status: varchar({ length: 20 }).default('active').notNull(),
	lastLogin: timestamp("last_login", { withTimezone: true, mode: 'string' }),
	createdBy: uuid("created_by"),
}, (table) => [
	unique("user_email_unique").on(table.email),
]);

export const staff = pgTable("staff", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	employeeCode: varchar("employee_code", { length: 50 }).notNull(),
	departmentId: varchar("department_id", { length: 50 }).notNull(),
	jobTitle: varchar("job_title", { length: 100 }).notNull(),
	hireDate: timestamp("hire_date", { withTimezone: true, mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "staff_user_id_user_id_fk"
		}).onDelete("cascade"),
	unique("staff_employee_code_unique").on(table.employeeCode),
]);

export const doctor = pgTable("doctor", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	specialization: varchar({ length: 100 }).notNull(),
	licenseNumber: varchar("license_number", { length: 50 }).notNull(),
	consultationDuration: varchar("consultation_duration", { length: 20 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	doctorNumber: varchar("doctor_number", { length: 20 }).default(sql`(\'DOC-\'::text || lpad((nextval(\'doctor_number_seq\'::regclass))::text, 6, \'0\'::text))`).notNull(),
}, (table) => [
	uniqueIndex("doctor_doctor_number_unique").using("btree", table.doctorNumber.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "doctor_user_id_user_id_fk"
		}).onDelete("cascade"),
	unique("doctor_license_number_unique").on(table.licenseNumber),
]);

export const receptionist = pgTable("receptionist", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	receptionistNumber: varchar("receptionist_number", { length: 20 }).default(sql`(\'REC-\'::text || lpad((nextval(\'receptionist_number_seq\'::regclass))::text, 6, \'0\'::text))`).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "receptionist_user_id_fkey"
		}).onDelete("cascade"),
	unique("receptionist_receptionist_number_key").on(table.receptionistNumber),
]);

export const patient = pgTable("patient", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	phn: varchar({ length: 50 }).notNull(),
	patientNumber: varchar("patient_number", { length: 20 }).default(sql`(\'PAT-\'::text || lpad((nextval(\'patient_number_seq\'::regclass))::text, 6, \'0\'::text))`).notNull(),
	phone: varchar({ length: 20 }),
	gender: varchar({ length: 20 }),
	dateOfBirth: timestamp("date_of_birth", { withTimezone: true, mode: 'string' }),
	address: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("patient_patient_number_unique").using("btree", table.patientNumber.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "patient_user_id_user_id_fk"
		}).onDelete("cascade"),
	unique("patient_phn_unique").on(table.phn),
]);
