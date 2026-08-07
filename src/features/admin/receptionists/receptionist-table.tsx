"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { ReceptionistListDTO } from "@/features/receptionists/types/receptionist.types";
import { statusVariant, initials } from "@/lib/utils";
import { ReceptionistRowActions } from "./receptionist-row-actions";
import { UserTableSkeleton } from "../components/ui/table-skeleton";
import { UserTableError } from "../components/ui/table-error";
import { UserTableEmpty } from "../components/ui/table-empty";

interface ReceptionistTableProps {
  data: ReceptionistListDTO[];
  total: number;
  isPending: boolean;
  onRefresh: () => void;
  error?: string | null;
}

const SKELETON_COLUMNS = [
  { key: "receptionistNumber", label: "Receptionist Number", sortable: false },
  { key: "name", label: "Receptionist", sortable: false },
  { key: "department", label: "Department", sortable: false },
  { key: "status", label: "Status", sortable: false },
];

export function ReceptionistTable({
  data,
  total,
  isPending,
  onRefresh,
  error,
}: ReceptionistTableProps) {
  if (error) {
    return (
      <UserTableError error={error} title="Failed to load receptionists" />
    );
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Receptionist Number</TableHead>
            <TableHead>Receptionist</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-end">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isPending ? (
            <TableRow>
              <TableCell colSpan={6} className="p-0">
                <UserTableSkeleton columns={SKELETON_COLUMNS} />
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="p-0">
                <UserTableEmpty
                  onRefresh={onRefresh}
                  title="No receptionists found"
                  description="Try changing your filters or add a new receptionist."
                />
              </TableCell>
            </TableRow>
          ) : (
            data.map((receptionist) => (
              <TableRow key={receptionist.id}>
                <TableCell className="font-medium text-muted-foreground">
                  {receptionist.receptionistNumber}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      <AvatarFallback>
                        {initials(receptionist.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate font-medium">
                        {receptionist.fullName}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {receptionist.email}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {receptionist.departmentName ?? "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant(receptionist.status)}>
                    {receptionist.status.charAt(0).toUpperCase() +
                      receptionist.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-end">
                  <ReceptionistRowActions receptionist={receptionist} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {!isPending && data.length > 0 ? (
        <div className="border-t px-4 py-3 text-xs text-muted-foreground">
          Showing {total} {total === 1 ? "receptionist" : "receptionists"}
        </div>
      ) : null}
    </div>
  );
}
