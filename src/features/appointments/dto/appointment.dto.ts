import type { AppointmentRecord, DisabledAppointmentDateRecord } from "../repositories/appointment.repository";
import type { AppointmentListDTO, DisabledAppointmentDateDTO } from "../types/appointment.types";

export function toAppointmentListDTO(record: AppointmentRecord): AppointmentListDTO {
  return {
    id: record.id,
    patientId: record.patientId,
    patientName: record.patientName,
    patientNumber: record.patientNumber,
    doctorId: record.doctorId,
    doctorName: record.doctorName,
    scheduledDate: record.scheduledDate,
    startTime: record.startTime,
    endTime: record.endTime,
    status: record.status,
    notes: record.notes,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export function toDisabledAppointmentDateDTO(
  record: DisabledAppointmentDateRecord,
): DisabledAppointmentDateDTO {
  return {
    id: record.id,
    disabledDate: record.disabledDate,
    reason: record.reason,
    createdBy: record.createdBy,
    createdByName: record.createdByName,
    createdAt: record.createdAt,
  };
}
