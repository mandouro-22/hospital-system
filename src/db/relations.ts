import { relations } from "drizzle-orm/relations";
import { user, account, session, staff, doctor, receptionist, patient, department, specialty, appointment, disabledAppointmentDate } from "./schema";

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	accounts: many(account),
	sessions: many(session),
	staff: many(staff),
	doctors: many(doctor),
	receptionists: many(receptionist),
	patients: many(patient),
	disabledAppointmentDates: many(disabledAppointmentDate),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const staffRelations = relations(staff, ({one}) => ({
	user: one(user, {
		fields: [staff.userId],
		references: [user.id]
	}),
	department: one(department, {
		fields: [staff.departmentId],
		references: [department.id]
	}),
}));

export const doctorRelations = relations(doctor, ({one, many}) => ({
	user: one(user, {
		fields: [doctor.userId],
		references: [user.id]
	}),
	appointments: many(appointment),
}));

export const receptionistRelations = relations(receptionist, ({one}) => ({
	user: one(user, {
		fields: [receptionist.userId],
		references: [user.id]
	}),
}));

export const patientRelations = relations(patient, ({one, many}) => ({
	user: one(user, {
		fields: [patient.userId],
		references: [user.id]
	}),
	appointments: many(appointment),
}));

export const appointmentRelations = relations(appointment, ({one}) => ({
	patient: one(patient, {
		fields: [appointment.patientId],
		references: [patient.id]
	}),
	doctor: one(doctor, {
		fields: [appointment.doctorId],
		references: [doctor.id]
	}),
}));

export const disabledAppointmentDateRelations = relations(disabledAppointmentDate, ({one}) => ({
	createdByUser: one(user, {
		fields: [disabledAppointmentDate.createdBy],
		references: [user.id]
	}),
}));

export const departmentRelations = relations(department, ({many}) => ({
	staff: many(staff),
}));

export const specialtyRelations = relations(specialty, ({many}) => ({
	// Doctors reference specialty through the specialization field (string-based)
}));