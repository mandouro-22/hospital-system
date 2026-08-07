import type { DoctorListDTO, DoctorDetailDTO, DoctorScheduleDTO } from "../types/doctor.types";
import type { DoctorRecord } from "../repositories/doctor.repository";

export function toDoctorListDTO(record: DoctorRecord): DoctorListDTO {
  return {
    id: record.id,
    userId: record.userId,
    doctorNumber: record.doctorNumber,
    fullName: record.name,
    email: record.email,
    specialization: record.specialization,
    departmentName: record.departmentName,
    status: record.status,
  };
}

export function toDoctorDetailDTO(record: DoctorRecord): DoctorDetailDTO {
  return {
    ...toDoctorListDTO(record),
    licenseNumber: record.licenseNumber,
    consultationDuration: record.consultationDuration,
    jobTitle: record.jobTitle,
    employeeCode: record.employeeCode,
    image: record.image,
  };
}

export function toDoctorScheduleDTO(row: DoctorScheduleDTO): DoctorScheduleDTO {
  return {
    id: row.id,
    doctorId: row.doctorId,
    dayOfWeek: row.dayOfWeek,
    startTime: row.startTime,
    endTime: row.endTime,
  };
}