export type SpecialtyOption = {
  id: string;
  name: string;
};

export type SpecialtyStatus = "active" | "inactive";

export interface SpecialtyDTO {
  id: string;
  name: string;
  description: string | null;
  status: SpecialtyStatus;
  createdAt: string;
  updatedAt: string;
  doctorCount: number;
}

export interface SpecialtyListDTO {
  id: string;
  name: string;
  description: string | null;
  status: SpecialtyStatus;
  createdAt: string;
  updatedAt: string;
  doctorCount: number;
}

export type SpecialtyDetailDTO = SpecialtyListDTO & {
  // Extended fields for detail view can be added here
};