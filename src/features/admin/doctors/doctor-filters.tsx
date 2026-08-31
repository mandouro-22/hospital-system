"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DepartmentOption } from "@/features/departments/types/department.types";
import type { UserStatus } from "@/features/auth/types/auth.types";
import type { DoctorListInput } from "@/features/doctors/validations/doctor.schema";
import { SpecialtyOption } from "@/features/specialties/types/specialty.types";

const STATUS_OPTIONS: UserStatus[] = [
  "active",
  "inactive",
  "locked",
  "suspended",
  "pending",
];

type DoctorFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  departments: DepartmentOption[];
  department: string | "all";
  onDepartmentChange: (value: string | "all") => void;
  specialties: SpecialtyOption[];
  specialization: NonNullable<DoctorListInput["specialization"]> | "all";
  onSpecializationChange: (
    value: NonNullable<DoctorListInput["specialization"]> | "all",
  ) => void;
  status: UserStatus | "all";
  onStatusChange: (value: UserStatus | "all") => void;
};

export function DoctorFilters({
  search,
  onSearchChange,
  departments,
  department,
  onDepartmentChange,
  specialties,
  specialization,
  onSpecializationChange,
  status,
  onStatusChange,
}: DoctorFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute top-1/2 inset-s-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by doctor number or name..."
          className="ps-8"
          aria-label="Search doctors"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Label htmlFor="department-filter" className="sr-only">
          Filter by department
        </Label>
        <Select
          value={department}
          onValueChange={(value) =>
            onDepartmentChange(value === "all" ? "all" : value)
          }
        >
          <SelectTrigger id="department-filter" className="w-44">
            <SelectValue placeholder="All departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All departments</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Label htmlFor="specialization-filter" className="sr-only">
          Filter by specialty
        </Label>
        <Select
          value={specialization}
          onValueChange={(value) =>
            onSpecializationChange(
              value === "all"
                ? "all"
                : (value as NonNullable<DoctorListInput["specialization"]>),
            )
          }
        >
          <SelectTrigger id="specialization-filter" className="w-44">
            <SelectValue placeholder="All specialties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All specialties</SelectItem>
            {specialties.map((spec) => (
              <SelectItem key={spec.id} value={spec.name}>
                {spec.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Label htmlFor="status-filter" className="sr-only">
          Filter by status
        </Label>
        <Select
          value={status}
          onValueChange={(value) => onStatusChange(value as UserStatus | "all")}
        >
          <SelectTrigger id="status-filter" className="w-40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUS_OPTIONS.map((statusOption) => (
              <SelectItem key={statusOption} value={statusOption}>
                {statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
