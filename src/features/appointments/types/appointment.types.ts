export type AppointmentStatus =
  | "scheduled"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";

export type AppointmentListDTO = {
  id: string;
  patientId: string;
  patientName: string;
  patientNumber: string;
  doctorId: string;
  doctorName: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DisabledAppointmentDateDTO = {
  id: string;
  disabledDate: string;
  reason: string | null;
  createdBy: string | null;
  createdByName: string | null;
  createdAt: string;
};
