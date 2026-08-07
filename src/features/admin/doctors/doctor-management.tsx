"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { useDoctors } from "@/features/doctors/hooks/use-doctors";
import { useDepartments } from "@/features/departments/hooks/use-departments";
import type { DoctorListInput } from "@/features/doctors/validations/doctor.schema";
import type { UserStatus } from "@/features/auth/types/auth.types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DoctorFilters } from "./doctor-filters";
import { DoctorTable } from "./doctor-table";
import { DoctorPagination } from "./doctor-pagination";

type Specialization = NonNullable<DoctorListInput["specialization"]>;

function AddDoctorButton() {
  return (
    <Button asChild>
      <Link href="/admin/doctors/add">
        <PlusIcon />
        Add Doctor
      </Link>
    </Button>
  );
}

export default function DoctorManagement() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [departmentId, setDepartmentId] = useState<string | "all">("all");
  const [specialization, setSpecialization] = useState<Specialization | "all">("all");
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

  const params = useMemo<DoctorListInput>(
    () => ({
      page,
      limit,
      search: debouncedSearch || undefined,
      departmentId: departmentId === "all" ? undefined : departmentId,
      specialization: specialization === "all" ? undefined : specialization,
      status: status === "all" ? undefined : status,
    }),
    [page, limit, debouncedSearch, departmentId, specialization, status],
  );

  const { data, isPending, error, refetch } = useDoctors(params);

  const handleDepartmentChange = (value: string | "all") => {
    setDepartmentId(value);
    setPage(1);
  };

  const handleSpecializationChange = (value: Specialization | "all") => {
    setSpecialization(value);
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
          <h2 className="text-2xl font-bold">Doctor Management</h2>
          <p className="text-sm text-muted-foreground">
            View, filter and manage hospital doctors.
          </p>
        </div>
        <AddDoctorButton />
      </div>

      <DoctorFilters
        search={search}
        onSearchChange={setSearch}
        departments={departments}
        department={departmentId}
        onDepartmentChange={handleDepartmentChange}
        specialization={specialization}
        onSpecializationChange={handleSpecializationChange}
        status={status}
        onStatusChange={handleStatusChange}
      />

      <Card className="overflow-hidden p-0">
        <DoctorTable
          data={data?.data ?? []}
          total={data?.pagination.total ?? 0}
          isPending={isPending}
          onRefresh={() => refetch()}
          error={error?.message}
        />
      </Card>

      {!isPending && data && data.pagination.totalPages > 1 ? (
        <DoctorPagination
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