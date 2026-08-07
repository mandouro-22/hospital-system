import type {
  ReceptionistDetailDTO,
  ReceptionistListDTO,
  ReceptionistRecord,
} from "../types/receptionist.types";

export function toReceptionistListDTO(
  record: ReceptionistRecord,
): ReceptionistListDTO {
  return {
    id: record.id,
    userId: record.userId,
    receptionistNumber: record.receptionistNumber,
    fullName: record.name,
    email: record.email,
    departmentName: record.departmentName,
    status: record.status,
  };
}

export function toReceptionistDetailDTO(
  record: ReceptionistRecord,
): ReceptionistDetailDTO {
  return {
    ...toReceptionistListDTO(record),
    jobTitle: record.jobTitle,
    employeeCode: record.employeeCode,
    image: record.image,
  };
}
