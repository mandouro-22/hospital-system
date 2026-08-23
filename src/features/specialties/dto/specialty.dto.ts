import type { SpecialtyRecord } from "../repositories/specialty.repository";
import type { SpecialtyListDTO, SpecialtyDetailDTO } from "../types/specialty.types";

export function toSpecialtyListDTO(record: SpecialtyRecord): SpecialtyListDTO {
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

export function toSpecialtyDetailDTO(record: SpecialtyRecord): SpecialtyDetailDTO {
  return {
    ...toSpecialtyListDTO(record),
  };
}