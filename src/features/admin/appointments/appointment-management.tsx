"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useAppointments } from "@/features/appointments/hooks/use-appointments";
import type { AppointmentStatus } from "@/features/appointments/types/appointment.types";
import type { AppointmentListInput } from "@/features/appointments/validations/appointment.schema";
import { AppointmentFilters } from "./appointment-filters";
import { AppointmentPagination } from "./appointment-pagination";
import { AppointmentTable } from "./appointment-table";
import { DisabledDatesCard } from "./disabled-dates-card";

export default function AppointmentManagement() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState<AppointmentStatus | "all">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const params = useMemo<AppointmentListInput>(
    () => ({
      page,
      limit,
      search: debouncedSearch || undefined,
      status: status === "all" ? undefined : status,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    }),
    [page, limit, debouncedSearch, status, dateFrom, dateTo],
  );

  const { data, isPending, error, refetch } = useAppointments(params);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-bold">
          <CalendarDays className="size-6 text-primary" />
          Appointments
        </h2>
        <p className="text-sm text-muted-foreground">
          Review all hospital appointments and disable dates that should not be booked.
        </p>
      </div>

      <DisabledDatesCard />

      <AppointmentFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
        dateFrom={dateFrom}
        onDateFromChange={(value) => {
          setDateFrom(value);
          setPage(1);
        }}
        dateTo={dateTo}
        onDateToChange={(value) => {
          setDateTo(value);
          setPage(1);
        }}
      />

      <Card className="overflow-hidden p-0">
        <AppointmentTable
          data={data?.data ?? []}
          total={data?.pagination.total ?? 0}
          isPending={isPending}
          onRefresh={() => refetch()}
          error={error?.message}
        />
      </Card>

      {!isPending && data && data.pagination.totalPages > 1 ? (
        <AppointmentPagination
          page={page}
          totalPages={data.pagination.totalPages}
          total={data.pagination.total}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={(value) => {
            setLimit(value);
            setPage(1);
          }}
        />
      ) : null}
    </div>
  );
}
