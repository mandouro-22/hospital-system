"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw, TriangleAlert, PlusIcon } from "lucide-react";
import { useUsers } from "@/features/auth/hooks/use-users";
import type { PaginationInput } from "@/features/auth/validations/pagination.schema";
import type { Role, UserStatus } from "@/features/auth/types/auth.types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserFilters } from "./user-filters";
import { UserTable } from "./user-table";
import { UserPagination } from "./user-pagination";

export type SortableColumn = "name" | "email" | "role" | "status" | "lastLogin" | "createdAt";
export type SortOrder = "asc" | "desc";

function AddUserButton() {
  return (
    <Button asChild>
      <a href="/admin/users/add">
        <PlusIcon />
        Add User
      </a>
    </Button>
  );
}

export default function UserManagement() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [role, setRole] = useState<Role | "all">("all");
  const [status, setStatus] = useState<UserStatus | "all">("all");
  const [sortBy, setSortBy] = useState<SortableColumn>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const params = useMemo<PaginationInput>(
    () => ({
      page,
      limit,
      search: debouncedSearch || undefined,
      role: role === "all" ? undefined : role,
      status: status === "all" ? undefined : status,
      sortBy,
      sortOrder,
    }),
    [page, limit, debouncedSearch, role, status, sortBy, sortOrder],
  );

  const { data, isPending, error, refetch } = useUsers(params);

  const handleSort = (column: SortableColumn) => {
    if (sortBy === column) {
      setSortOrder((order) => (order === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortOrder(column === "createdAt" ? "desc" : "asc");
    }
    setPage(1);
  };

  const handleRoleChange = (value: Role | "all") => {
    setRole(value);
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
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-sm text-muted-foreground">
            View, filter and manage hospital users.
          </p>
        </div>
        <AddUserButton />
      </div>

      <UserFilters
        search={search}
        onSearchChange={setSearch}
        role={role}
        onRoleChange={handleRoleChange}
        status={status}
        onStatusChange={handleStatusChange}
      />

      <Card className="overflow-hidden p-0">
        <UserTable
          data={data?.data ?? []}
          total={data?.pagination.total ?? 0}
          isPending={isPending}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          onRefresh={() => refetch()}
          error={error?.message}
        />
      </Card>

      {!isPending && data && data.pagination.totalPages > 1 ? (
        <UserPagination
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
