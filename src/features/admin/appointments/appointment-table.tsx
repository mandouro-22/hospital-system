"use client";

import { CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AppointmentListDTO, AppointmentStatus } from "@/features/appointments/types/appointment.types";
import { UserTableSkeleton } from "../components/ui/table-skeleton";
import { UserTableError } from "../components/ui/table-error";
import { UserTableEmpty } from "../components/ui/table-empty";

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  scheduled: "Scheduled",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No show",
};

function appointmentStatusVariant(
  status: AppointmentStatus,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "cancelled":
    case "no_show":
      return "destructive";
    case "completed":
      return "secondary";
    case "confirmed":
      return "default";
    default:
      return "outline";
  }
}

export function formatCalendarDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const SKELETON_COLUMNS = [
  { key: "patient", label: "Patient", sortable: false },
  { key: "doctor", label: "Doctor", sortable: false },
  { key: "date", label: "Date", sortable: false },
  { key: "time", label: "Time", sortable: false },
  { key: "status", label: "Status", sortable: false },
];

interface AppointmentTableProps {
  data: AppointmentListDTO[];
  total: number;
  isPending: boolean;
  onRefresh: () => void;
  error?: string | null;
}

export function AppointmentTable({
  data,
  total,
  isPending,
  onRefresh,
  error,
}: AppointmentTableProps) {
  if (error) {
    return <UserTableError error={error} title="Failed to load appointments" />;
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Patient</TableHead>
            <TableHead>Doctor</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isPending ? (
            <TableRow>
              <TableCell colSpan={5} className="p-0">
                <UserTableSkeleton columns={SKELETON_COLUMNS} />
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="p-0">
                <UserTableEmpty
                  onRefresh={onRefresh}
                  title="No appointments found"
                  description="Booked appointments will appear here. You can still disable dates for future booking."
                />
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                      <CalendarDays className="size-4 text-primary" />
                    </div>
                    <div>
                      <p>{item.patientName}</p>
                      <p className="text-xs text-muted-foreground">{item.patientNumber}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{item.doctorName}</TableCell>
                <TableCell>{formatCalendarDate(item.scheduledDate)}</TableCell>
                <TableCell className="text-muted-foreground">
                  {item.startTime}–{item.endTime}
                </TableCell>
                <TableCell>
                  <Badge variant={appointmentStatusVariant(item.status)}>
                    {STATUS_LABELS[item.status]}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {!isPending && data.length > 0 ? (
        <div className="border-t px-4 py-3 text-xs text-muted-foreground">
          Showing {total} {total === 1 ? "appointment" : "appointments"}
        </div>
      ) : null}
    </div>
  );
}
