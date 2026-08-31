"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PlusIcon, BriefcaseMedical } from "lucide-react";
import { useSpecialties } from "@/features/specialties/hooks/use-specialties";
import type { SpecialtyListInput } from "@/features/specialties/validations/specialty.schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SpecialtyFilters } from "./specialty-filters";
import { SpecialtyTable } from "./specialty-table";
import { SpecialtyPagination } from "./specialty-pagination";

function AddSpecialtyButton() {
  return (
    <Button asChild>
      <Link href="/admin/specialties/add">
        <PlusIcon />
        Add Specialty
      </Link>
    </Button>
  );
}

export default function SpecialtyManagement() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState<
    NonNullable<SpecialtyListInput["status"]> | "all"
  >("all");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const params = useMemo<SpecialtyListInput>(
    () => ({
      page,
      limit,
      search: debouncedSearch || undefined,
      status: status === "all" ? undefined : status,
    }),
    [page, limit, debouncedSearch, status],
  );

  const { data, isPending, error, refetch } = useSpecialties(params);

  const handleStatusChange = (
    value: NonNullable<SpecialtyListInput["status"]> | "all",
  ) => {
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
            <BriefcaseMedical className="size-6 text-chart-3" />
            Specialties
          </h2>
          <p className="text-sm text-muted-foreground">
            View, filter and manage doctor specialties.
          </p>
        </div>
        <AddSpecialtyButton />
      </div>

      <SpecialtyFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={handleStatusChange}
      />

      <Card className="overflow-hidden p-0">
        <SpecialtyTable
          data={data?.data ?? []}
          total={data?.pagination.total ?? 0}
          isPending={isPending}
          onRefresh={() => refetch()}
          error={error?.message}
        />
      </Card>

      {!isPending && data && data.pagination.totalPages > 1 ? (
        <SpecialtyPagination
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
