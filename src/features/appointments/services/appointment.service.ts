import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { AppointmentRepository } from "../repositories/appointment.repository";
import type { AppointmentListInput, DisableAppointmentDateInput } from "../validations/appointment.schema";

function todayIsoDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const AppointmentService = {
  async findAll(params: AppointmentListInput) {
    return AppointmentRepository.findAll(params);
  },

  async listDisabledDates() {
    return AppointmentRepository.findDisabledDates();
  },

  async disableDate(input: DisableAppointmentDateInput, createdBy: string) {
    if (input.date < todayIsoDate()) {
      throw AppError.badRequest("Past dates cannot be disabled");
    }

    const existing = await AppointmentRepository.findDisabledDateByDate(input.date);
    if (existing) {
      throw AppError.conflict("This date is already disabled");
    }

    const record = await AppointmentRepository.createDisabledDate(input, createdBy);
    logger.info("appointment.date.disabled", { date: input.date, createdBy });
    return record;
  },

  async enableDate(id: string) {
    const record = await AppointmentRepository.findDisabledDateById(id);
    if (!record) {
      throw AppError.notFound("Disabled date not found");
    }

    await AppointmentRepository.deleteDisabledDate(id);
    logger.info("appointment.date.enabled", { date: record.disabledDate, id });
    return record;
  },
};
