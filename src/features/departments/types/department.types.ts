export type DepartmentOption = {
  id: string;
  name: string;
};

export type DepartmentStatus = "active" | "inactive";

export interface DepartmentDTO {
  id: string;
  name: string;
  description: string | null;
  status: DepartmentStatus;
  createdAt: string;
  updatedAt: string;
  doctorCount: number;
}

export interface DepartmentListDTO {
  id: string;
  name: string;
  description: string | null;
  status: DepartmentStatus;
  createdAt: string;
  updatedAt: string;
  doctorCount: number;
}

export type DepartmentDetailDTO = DepartmentListDTO & {
  // Extended fields for detail view can be added here
};
