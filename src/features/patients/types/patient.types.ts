import type { UserStatus } from "@/features/auth/types/auth.types";

export type PatientListDTO = {
  id: string;
  userId: string;
  patientNumber: string;
  fullName: string;
  email: string;
  phone: string | null;
  status: UserStatus;
  registrationDate: string;
};

export type PatientDetailDTO = PatientListDTO & {
  phn: string;
  gender: string | null;
  dateOfBirth: string | null;
  address: string | null;
  registeredByName: string | null;
  updatedAt: string;
};