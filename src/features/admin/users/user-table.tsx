"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { SanitizedUserDTO } from "@/features/auth/types/auth.types";
import { formatDate, statusVariant, initials } from "@/lib/utils";
import type { SortableColumn, SortOrder } from "./user-management";
import { UserRowActions } from "./user-row-actions";
import { UserTableSkeleton } from "../components/ui/table-skeleton";
import { UserTableError } from "../components/ui/table-error";
import { UserTableEmpty } from "../components/ui/table-empty";
// import { SortableHeader } from "./ui/table-sort";

interface UserTableProps {
  data: SanitizedUserDTO[];
  total: number;
  isPending: boolean;
  sortBy: SortableColumn;
  sortOrder: SortOrder;
  onSort: (column: SortableColumn) => void;
  onRefresh: () => void;
  error?: string | null;
}

const COLUMNS: { key: SortableColumn; label: string; sortable: boolean }[] = [
  { key: "name", label: "Name", sortable: true },
  { key: "email", label: "Email", sortable: true },
  { key: "role", label: "Role", sortable: true },
  { key: "status", label: "Status", sortable: true },
  { key: "lastLogin", label: "Last Login", sortable: true },
  { key: "createdAt", label: "Created At", sortable: true },
];

export function UserTable({
  data,
  total,
  isPending,
  sortBy,
  sortOrder,
  onSort,
  onRefresh,
  error,
}: UserTableProps) {
  const tableColumns = COLUMNS;

  if (error) {
    return <UserTableError error={error} />;
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            {/* {tableColumns.map((column) => (
              <SortableHeader
                key={column.key}
                column={column.key}
                label={column.label}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
              />
            ))} */}
            <TableHead>Status</TableHead>
            <TableHead>Last Login</TableHead>
            <TableHead className="text-end">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isPending ? (
            <TableRow>
              <TableCell colSpan={8} className="p-0">
                <UserTableSkeleton columns={tableColumns} />
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="p-0">
                <UserTableEmpty onRefresh={onRefresh} />
              </TableCell>
            </TableRow>
          ) : (
            data.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      {user.image ? (
                        <AvatarImage src={user.image} alt={user.fullName} />
                      ) : null}
                      <AvatarFallback>{initials(user.fullName)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{user.fullName}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {user.email}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{user.role}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant(user.status)}>
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(user.lastLogin)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(user.createdAt)}
                </TableCell>
                <TableCell className="text-end">
                  <UserRowActions user={user} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {!isPending && data.length > 0 ? (
        <div className="border-t px-4 py-3 text-xs text-muted-foreground">
          Showing {total} {total === 1 ? "user" : "users"}
        </div>
      ) : null}
    </div>
  );
}
