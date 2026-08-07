import type { UserStatus } from "@/features/auth/types/auth.types";

export type DoctorListDTO = {
  id: string;
  userId: string;
  doctorNumber: string;
  fullName: string;
  email: string;
  specialization: string;
  departmentName: string | null;
  status: UserStatus;
};

export type DoctorDetailDTO = DoctorListDTO & {
  licenseNumber: string;
  consultationDuration: string;
  jobTitle: string | null;
  employeeCode: string | null;
  image: string | null;
};

export type DoctorScheduleDTO = {
  id: string;
  doctorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

export type DoctorFilters = {
  departmentId?: string;
  specialization?: string;
  status?: UserStatus;
};