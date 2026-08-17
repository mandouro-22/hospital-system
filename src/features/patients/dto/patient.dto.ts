import type {
  PatientDetailDTO,
  PatientListDTO,
} from "../types/patient.types";
import type { PatientRecord } from "../repositories/patient.repository";

export function toPatientListDTO(record: PatientRecord): PatientListDTO {
  return {
    id: record.id,
    userId: record.userId,
    patientNumber: record.patientNumber,
    fullName: record.name,
    email: record.email,
    phone: record.phone,
    status: record.status,
    registrationDate: record.createdAt,
  };
}

export function toPatientDetailDTO(record: PatientRecord): PatientDetailDTO {
  return {
    ...toPatientListDTO(record),
    phn: record.phn,
    gender: record.gender,
    dateOfBirth: record.dateOfBirth,
    address: record.address,
    registeredByName: record.registeredByName,
    updatedAt: record.updatedAt,
  };
}