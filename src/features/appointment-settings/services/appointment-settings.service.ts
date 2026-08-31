import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { AppointmentSettingsRepository } from "../repositories/appointment-settings.repository";
import type { AppointmentSettingsDTO } from "../types/appointment-settings.types";
import type { UpdateAppointmentSettingsInput } from "../validations/appointment-settings.schema";

function toDTO(record: Awaited<ReturnType<typeof AppointmentSettingsRepository.find>>): AppointmentSettingsDTO {
  if (!record.configuration || record.workingHours.length !== 7) {
    throw AppError.internal("Appointment configuration has not been initialized");
  }

  return {
    defaultDuration: record.configuration.defaultDuration as AppointmentSettingsDTO["defaultDuration"],
    enabledStatuses: record.configuration.enabledStatuses as AppointmentSettingsDTO["enabledStatuses"],
    cancellationNoticeHours: record.configuration.cancellationNoticeHours as AppointmentSettingsDTO["cancellationNoticeHours"],
    requireDoctorSchedule: record.configuration.requireDoctorSchedule,
    workingHours: record.workingHours.map((hour) => ({
      dayOfWeek: hour.dayOfWeek,
      isClosed: hour.isClosed,
      startTime: hour.startTime,
      endTime: hour.endTime,
    })),
  };
}

export const AppointmentSettingsService = {
  async get(): Promise<AppointmentSettingsDTO> {
    return toDTO(await AppointmentSettingsRepository.find());
  },

  async update(input: UpdateAppointmentSettingsInput): Promise<AppointmentSettingsDTO> {
    const updated = await AppointmentSettingsRepository.update(input);
    logger.info("appointment-settings.updated");
    return toDTO(updated);
  },
};
