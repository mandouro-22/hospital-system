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
import type { PatientListDTO } from "@/features/patients/types/patient.types";
import { formatDate, statusVariant, initials } from "@/lib/utils";
import { PatientRowActions } from "./patient-row-actions";
import { UserTableSkeleton } from "../components/ui/table-skeleton";
import { UserTableError } from "../components/ui/table-error";
import { UserTableEmpty } from "../components/ui/table-empty";

interface PatientTableProps {
  data: PatientListDTO[];
  total: number;
  isPending: boolean;
  onRefresh: () => void;
  error?: string | null;
}

const SKELETON_COLUMNS = [
  { key: "patientNumber", label: "Patient Number", sortable: false },
  { key: "name", label: "Patient", sortable: false },
  { key: "phone", label: "Phone", sortable: false },
  { key: "registrationDate", label: "Registration Date", sortable: false },
  { key: "status", label: "Status", sortable: false },
];

export function PatientTable({
  data,
  total,
  isPending,
  onRefresh,
  error,
}: PatientTableProps) {
  if (error) {
    return <UserTableError error={error} title="Failed to load patients" />;
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Patient Number</TableHead>
            <TableHead>Patient</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Registration Date</TableHead>
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
                  title="No patients found"
                  description="Try changing your search or filters."
                />
              </TableCell>
            </TableRow>
          ) : (
            data.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell className="font-medium text-muted-foreground">
                  {patient.patientNumber}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      <AvatarFallback>
                        {initials(patient.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate font-medium">
                        {patient.fullName}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {patient.email}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {patient.phone ?? "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(patient.registrationDate)}
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant(patient.status)}>
                    {patient.status.charAt(0).toUpperCase() +
                      patient.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-end">
                  <PatientRowActions patient={patient} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {!isPending && data.length > 0 ? (
        <div className="border-t px-4 py-3 text-xs text-muted-foreground">
          Showing {total} {total === 1 ? "patient" : "patients"}
        </div>
      ) : null}
    </div>
  );
}