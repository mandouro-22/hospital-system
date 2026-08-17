"use client";

import { useEffect, useMemo, useState } from "react";
import { usePatients } from "@/features/patients/hooks/use-patients";
import type { PatientListInput } from "@/features/patients/validations/patient.schema";
import type { UserStatus } from "@/features/auth/types/auth.types";
import { Card } from "@/components/ui/card";
import { PatientFilters } from "./patient-filters";
import { PatientTable } from "./patient-table";
import { PatientPagination } from "./patient-pagination";

export default function PatientManagement() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState<UserStatus | "all">("all");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const params = useMemo<PatientListInput>(
    () => ({
      page,
      limit,
      search: debouncedSearch || undefined,
      status: status === "all" ? undefined : status,
    }),
    [page, limit, debouncedSearch, status],
  );

  const { data, isPending, error, refetch } = usePatients(params);

  const handleStatusChange = (value: UserStatus | "all") => {
    setStatus(value);
    setPage(1);
  };

  const handleLimitChange = (value: number) => {
    setLimit(value);
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Patient Management</h2>
          <p className="text-sm text-muted-foreground">
            Manage and review registered patients.
          </p>
        </div>
      </div>

      <PatientFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={handleStatusChange}
      />

      <Card className="overflow-hidden p-0">
        <PatientTable
          data={data?.data ?? []}
          total={data?.pagination.total ?? 0}
          isPending={isPending}
          onRefresh={() => refetch()}
          error={error?.message}
        />
      </Card>

      {!isPending && data && data.pagination.totalPages > 1 ? (
        <PatientPagination
          page={page}
          totalPages={data.pagination.totalPages}
          total={data.pagination.total}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={handleLimitChange}
        />
      ) : null}
    </div>
  );
}