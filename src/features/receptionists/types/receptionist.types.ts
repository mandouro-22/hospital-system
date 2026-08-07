import type { UserStatus } from "@/features/auth/types/auth.types";

export type ReceptionistListDTO = {
  id: string;
  userId: string;
  receptionistNumber: string;
  fullName: string;
  email: string;
  departmentId: string | null;
  departmentName: string | null;
  status: UserStatus;
};

export type ReceptionistDetailDTO = ReceptionistListDTO & {
  jobTitle: string | null;
  employeeCode: string | null;
  image: string | null;
};

export type ReceptionistFilters = {
  departmentId?: string;
  status?: UserStatus;
};
