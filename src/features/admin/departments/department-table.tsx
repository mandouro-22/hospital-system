"use client";

import { Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { DepartmentListDTO } from "@/features/departments/types/department.types";
import { statusVariant } from "@/lib/utils";
import { DepartmentRowActions } from "./department-row-actions";
import { UserTableSkeleton } from "../components/ui/table-skeleton";
import { UserTableError } from "../components/ui/table-error";
import { UserTableEmpty } from "../components/ui/table-empty";

const SKELETON_COLUMNS = [
  { key: "name", label: "Name", sortable: false },
  { key: "description", label: "Description", sortable: false },
  { key: "doctors", label: "Doctors", sortable: false },
  { key: "status", label: "Status", sortable: false },
];

interface DepartmentTableProps {
  data: DepartmentListDTO[];
  total: number;
  isPending: boolean;
  onRefresh: () => void;
  error?: string | null;
}

export function DepartmentTable({
  data,
  total,
  isPending,
  onRefresh,
  error,
}: DepartmentTableProps) {
  if (error) {
    return <UserTableError error={error} title="Failed to load departments" />;
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Doctors</TableHead>
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
                  title="No departments found"
                  description="Try changing your filters or add a new department."
                />
              </TableCell>
            </TableRow>
          ) : (
            data.map((dept) => (
              <TableRow key={dept.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                      <Building2 className="size-4 text-primary" />
                    </div>
                    {dept.name}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground max-w-xs truncate">
                  {dept.description ?? "—"}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{dept.doctorCount}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant(dept.status)}>
                    {dept.status.charAt(0).toUpperCase() + dept.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-end">
                  <DepartmentRowActions department={dept} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {!isPending && data.length > 0 ? (
        <div className="border-t px-4 py-3 text-xs text-muted-foreground">
          Showing {total} {total === 1 ? "department" : "departments"}
        </div>
      ) : null}
    </div>
  );
}