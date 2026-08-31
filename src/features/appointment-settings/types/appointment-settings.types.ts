import type { CONSULTATION_DURATIONS } from "@/features/auth/constants/staff-options";

export type AppointmentStatus =
  | "scheduled"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";

export type AppointmentDuration = (typeof CONSULTATION_DURATIONS)[number];
export type CancellationNoticeHours = 0 | 2 | 4 | 12 | 24 | 48;

export type HospitalWorkingHour = {
  dayOfWeek: number;
  isClosed: boolean;
  startTime: string | null;
  endTime: string | null;
};

export type AppointmentSettingsDTO = {
  defaultDuration: AppointmentDuration;
  enabledStatuses: AppointmentStatus[];
  cancellationNoticeHours: CancellationNoticeHours;
  requireDoctorSchedule: boolean;
  workingHours: HospitalWorkingHour[];
};
