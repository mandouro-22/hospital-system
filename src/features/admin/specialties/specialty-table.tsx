"use client";

import { BriefcaseMedical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SpecialtyListDTO } from "@/features/specialties/types/specialty.types";
import { statusVariant } from "@/lib/utils";
import { SpecialtyRowActions } from "./specialty-row-actions";
import { UserTableSkeleton } from "../components/ui/table-skeleton";
import { UserTableError } from "../components/ui/table-error";
import { UserTableEmpty } from "../components/ui/table-empty";

const SKELETON_COLUMNS = [
  { key: "name", label: "Name", sortable: false },
  { key: "description", label: "Description", sortable: false },
  { key: "doctors", label: "Doctors", sortable: false },
  { key: "status", label: "Status", sortable: false },
];

interface SpecialtyTableProps {
  data: SpecialtyListDTO[];
  total: number;
  isPending: boolean;
  onRefresh: () => void;
  error?: string | null;
}

export function SpecialtyTable({
  data,
  total,
  isPending,
  onRefresh,
  error,
}: SpecialtyTableProps) {
  if (error) {
    return <UserTableError error={error} title="Failed to load specialties" />;
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
                  title="No specialties found"
                  description="Try changing your filters or add a new specialty."
                />
              </TableCell>
            </TableRow>
          ) : (
            data.map((spec) => (
              <TableRow key={spec.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-chart-3/10">
                      <BriefcaseMedical className="size-4 text-chart-3" />
                    </div>
                    {spec.name}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground max-w-xs truncate">
                  {spec.description ?? "—"}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{spec.doctorCount}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant(spec.status)}>
                    {spec.status.charAt(0).toUpperCase() + spec.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-end">
                  <SpecialtyRowActions specialty={spec} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {!isPending && data.length > 0 ? (
        <div className="border-t px-4 py-3 text-xs text-muted-foreground">
          Showing {total} {total === 1 ? "specialty" : "specialties"}
        </div>
      ) : null}
    </div>
  );
}