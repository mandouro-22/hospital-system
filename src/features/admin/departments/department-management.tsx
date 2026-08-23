"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PlusIcon, Building2 } from "lucide-react";
import { useDepartments } from "@/features/departments/hooks/use-departments";
import type { DepartmentListInput } from "@/features/departments/validations/department.schema";
import type { UserStatus } from "@/features/auth/types/auth.types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DepartmentFilters } from "./department-filters";
import { DepartmentTable } from "./department-table";
import { DepartmentPagination } from "./department-pagination";

function AddDepartmentButton() {
  return (
    <Button asChild>
      <Link href="/admin/departments/add">
        <PlusIcon />
        Add Department
      </Link>
    </Button>
  );
}

export default function DepartmentManagement() {
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

  const params = useMemo<DepartmentListInput>(
    () => ({
      page,
      limit,
      search: debouncedSearch || undefined,
      status: status === "all" ? undefined : status,
    }),
    [page, limit, debouncedSearch, status],
  );

  const { data, isPending, error, refetch } = useDepartments(params);

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
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="size-6 text-primary" />
            Departments
          </h2>
          <p className="text-sm text-muted-foreground">
            View, filter and manage hospital departments.
          </p>
        </div>
        <AddDepartmentButton />
      </div>

      <DepartmentFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={handleStatusChange}
      />

      <Card className="overflow-hidden p-0">
        <DepartmentTable
          data={data?.data ?? []}
          total={data?.pagination.total ?? 0}
          isPending={isPending}
          onRefresh={() => refetch()}
          error={error?.message}
        />
      </Card>

      {!isPending && data && data.pagination.totalPages > 1 ? (
        <DepartmentPagination
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