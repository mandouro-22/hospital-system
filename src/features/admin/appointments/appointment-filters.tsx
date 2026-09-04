"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { APPOINTMENT_STATUSES } from "@/features/appointment-settings/validations/appointment-settings.schema";
import type { AppointmentStatus } from "@/features/appointments/types/appointment.types";

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  scheduled: "Scheduled",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No show",
};

type AppointmentFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  status: AppointmentStatus | "all";
  onStatusChange: (value: AppointmentStatus | "all") => void;
  dateFrom: string;
  onDateFromChange: (value: string) => void;
  dateTo: string;
  onDateToChange: (value: string) => void;
};

export function AppointmentFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
}: AppointmentFiltersProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute top-1/2 inset-s-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search"
          className="ps-8"
          aria-label="Search appointments"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Label htmlFor="appointment-status-filter" className="sr-only">
          Filter by status
        </Label>
        <Select
          value={status}
          onValueChange={(value) => onStatusChange(value as AppointmentStatus | "all")}
        >
          <SelectTrigger id="appointment-status-filter" className="w-40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {APPOINTMENT_STATUSES.map((statusOption) => (
              <SelectItem key={statusOption} value={statusOption}>
                {STATUS_LABELS[statusOption]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Label htmlFor="appointment-date-from" className="sr-only">
          From date
        </Label>
        <Input
          id="appointment-date-from"
          type="date"
          value={dateFrom}
          onChange={(event) => onDateFromChange(event.target.value)}
          aria-label="From date"
          className="w-40"
        />
        <Label htmlFor="appointment-date-to" className="sr-only">
          To date
        </Label>
        <Input
          id="appointment-date-to"
          type="date"
          value={dateTo}
          onChange={(event) => onDateToChange(event.target.value)}
          aria-label="To date"
          className="w-40"
        />
      </div>
    </div>
  );
}
