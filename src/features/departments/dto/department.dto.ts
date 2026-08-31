import type { DepartmentRecord } from "../repositories/department.repository";
import type { DepartmentListDTO, DepartmentDetailDTO } from "../types/department.types";

export function toDepartmentListDTO(record: DepartmentRecord): DepartmentListDTO {
  return {
    id: record.id,
    name: record.name,
    description: record.description,
    status: record.status,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    doctorCount: record.doctorCount,
  };
}

export function toDepartmentDetailDTO(record: DepartmentRecord): DepartmentDetailDTO {
  return {
    ...toDepartmentListDTO(record),
  };
}