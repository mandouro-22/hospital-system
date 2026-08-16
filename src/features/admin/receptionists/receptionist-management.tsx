"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { useReceptionists } from "@/features/receptionists/hooks/use-receptionists";
import { useDepartments } from "@/features/departments/hooks/use-departments";
import type { ReceptionistListInput } from "@/features/receptionists/validations/receptionist.schema";
import type { UserStatus } from "@/features/auth/types/auth.types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReceptionistFilters } from "./receptionist-filters";
import { ReceptionistTable } from "./receptionist-table";
import { ReceptionistPagination } from "./receptionist-pagination";

function AddReceptionistButton() {
  return (
    <Button asChild>
      <Link href="/admin/receptionists/add">
        <PlusIcon />
        Add Receptionist
      </Link>
    </Button>
  );
}

export default function ReceptionistManagement() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [department, setDepartment] = useState<string | "all">("all");
  const [status, setStatus] = useState<UserStatus | "all">("all");
  const { data: departmentsResponse } = useDepartments();
  const departments = departmentsResponse?.data ?? [];

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const params = useMemo<ReceptionistListInput>(
    () => ({
      page,
      limit,
      search: debouncedSearch || undefined,
      departmentId: department === "all" ? undefined : department,
      status: status === "all" ? undefined : status,
    }),
    [page, limit, debouncedSearch, department, status],
  );

  const { data, isPending, error, refetch } = useReceptionists(params);

  const handleDepartmentChange = (value: string | "all") => {
    setDepartment(value);
    setPage(1);
  };

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
          <h2 className="text-2xl font-bold">Receptionist Management</h2>
          <p className="text-sm text-muted-foreground">
            View, filter and manage hospital receptionists.
          </p>
        </div>
        <AddReceptionistButton />
      </div>

      <ReceptionistFilters
        search={search}
        onSearchChange={setSearch}
        departments={departments}
        department={department}
        onDepartmentChange={handleDepartmentChange}
        status={status}
        onStatusChange={handleStatusChange}
      />

      <Card className="overflow-hidden p-0">
        <ReceptionistTable
          data={data?.data ?? []}
          total={data?.pagination.total ?? 0}
          isPending={isPending}
          onRefresh={() => refetch()}
          error={error?.message}
        />
      </Card>

      {!isPending && data && data.pagination.totalPages > 1 ? (
        <ReceptionistPagination
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
