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
import type { DoctorListDTO } from "@/features/doctors/types/doctor.types";
import { statusVariant, initials } from "@/lib/utils";
import { DoctorRowActions } from "./doctor-row-actions";
import { UserTableSkeleton } from "../components/ui/table-skeleton";
import { UserTableError } from "../components/ui/table-error";
import { UserTableEmpty } from "../components/ui/table-empty";

interface DoctorTableProps {
  data: DoctorListDTO[];
  total: number;
  isPending: boolean;
  onRefresh: () => void;
  error?: string | null;
}

const SKELETON_COLUMNS = [
  { key: "doctorNumber", label: "Doctor Number", sortable: false },
  { key: "name", label: "Doctor", sortable: false },
  { key: "specialty", label: "Specialty", sortable: false },
  { key: "department", label: "Department", sortable: false },
  { key: "status", label: "Status", sortable: false },
];

export function DoctorTable({
  data,
  total,
  isPending,
  onRefresh,
  error,
}: DoctorTableProps) {
  if (error) {
    return <UserTableError error={error} title="Failed to load doctors" />;
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Doctor Number</TableHead>
            <TableHead>Doctor</TableHead>
            <TableHead>Specialty</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-end">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isPending ? (
            <TableRow>
              <TableCell colSpan={7} className="p-0">
                <UserTableSkeleton columns={SKELETON_COLUMNS} />
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="p-0">
                <UserTableEmpty
                  onRefresh={onRefresh}
                  title="No doctors found"
                  description="Try changing your filters or add a new doctor."
                />
              </TableCell>
            </TableRow>
          ) : (
            data.map((doctor) => (
              <TableRow key={doctor.id}>
                <TableCell className="font-medium text-muted-foreground">
                  {doctor.doctorNumber}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      <AvatarFallback>{initials(doctor.fullName)}</AvatarFallback>
                    </Avatar>
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate font-medium">
                        {doctor.fullName}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {doctor.email}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{doctor.specialization}</TableCell>
                <TableCell className="text-muted-foreground">
                  {doctor.departmentName ?? "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant(doctor.status)}>
                    {doctor.status.charAt(0).toUpperCase() + doctor.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-end">
                  <DoctorRowActions doctor={doctor} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {!isPending && data.length > 0 ? (
        <div className="border-t px-4 py-3 text-xs text-muted-foreground">
          Showing {total} {total === 1 ? "doctor" : "doctors"}
        </div>
      ) : null}
    </div>
  );
}