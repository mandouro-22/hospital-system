import { relations } from "drizzle-orm/relations";
import { user, account, session, staff, doctor, receptionist } from "./schema";

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
}));

export const doctorRelations = relations(doctor, ({one}) => ({
	user: one(user, {
		fields: [doctor.userId],
		references: [user.id]
	}),
}));

export const receptionistRelations = relations(receptionist, ({one}) => ({
	user: one(user, {
		fields: [receptionist.userId],
		references: [user.id]
	}),
}));