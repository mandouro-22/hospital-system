import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { appointmentConfiguration, hospitalWorkingHours } from "@/db/schema";
import type { UpdateAppointmentSettingsInput } from "../validations/appointment-settings.schema";

const CONFIGURATION_ID = "default";

export const AppointmentSettingsRepository = {
  async find() {
    const [configuration] = await db
      .select()
      .from(appointmentConfiguration)
      .where(eq(appointmentConfiguration.id, CONFIGURATION_ID));
    const workingHours = await db
      .select()
      .from(hospitalWorkingHours)
      .orderBy(asc(hospitalWorkingHours.dayOfWeek));
    return { configuration, workingHours };
  },

  async update(input: UpdateAppointmentSettingsInput) {
    await db
      .update(appointmentConfiguration)
      .set({
        defaultDuration: input.defaultDuration,
        enabledStatuses: input.enabledStatuses,
        cancellationNoticeHours: input.cancellationNoticeHours,
        requireDoctorSchedule: input.requireDoctorSchedule,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(appointmentConfiguration.id, CONFIGURATION_ID));

    await Promise.all(
      input.workingHours.map((hour) =>
        db
          .update(hospitalWorkingHours)
          .set({
            isClosed: hour.isClosed,
            startTime: hour.isClosed ? null : hour.startTime,
            endTime: hour.isClosed ? null : hour.endTime,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(hospitalWorkingHours.dayOfWeek, hour.dayOfWeek)),
      ),
    );

    return this.find();
  },
};
