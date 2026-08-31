"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Eye } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateDoctor } from "@/features/doctors/hooks/use-doctors";
import { useActiveDepartments } from "@/features/departments/hooks/use-departments";
import { useActiveSpecialties } from "@/features/specialties/hooks/use-specialties";
import type { DoctorListDTO } from "@/features/doctors/types/doctor.types";
import type { UpdateDoctorInput } from "@/features/doctors/validations/doctor.schema";

type DoctorRowActionsProps = {
  doctor: DoctorListDTO;
};

export function DoctorRowActions({ doctor }: DoctorRowActionsProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState(doctor.fullName);
  const [departmentId, setDepartmentId] = useState<string | undefined>(
    undefined,
  );
  const [specialization, setSpecialization] = useState<
    NonNullable<UpdateDoctorInput["specialization"]>
  >(doctor.specialization as NonNullable<UpdateDoctorInput["specialization"]>);
  const updateDoctor = useUpdateDoctor();
  const { data: departmentsResponse } = useActiveDepartments();
  const departments = departmentsResponse?.data ?? [];
  const { data: specialtiesResponse } = useActiveSpecialties();
  const specialties = specialtiesResponse?.data ?? [];

  const openEdit = () => {
    setName(doctor.fullName);
    setDepartmentId(undefined);
    setSpecialization(
      doctor.specialization as NonNullable<UpdateDoctorInput["specialization"]>,
    );
    setEditOpen(true);
  };

  const handleUpdate = () => {
    updateDoctor.mutate(
      {
        id: doctor.id,
        input: {
          name,
          ...(departmentId ? { departmentId } : {}),
          specialization,
        },
      },
      {
        onSuccess: () => {
          toast.success("Doctor updated successfully");
          setEditOpen(false);
        },
        onError: (error) => {
          toast.error(error.message);
        },
      },
    );
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label="Doctor actions">
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem
            onClick={() => router.push(`/admin/doctors/${doctor.id}`)}
          >
            <Eye />
            View details
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={openEdit}>
            <Pencil />
            Edit
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit doctor</DialogTitle>
            <DialogDescription>
              Update the details for {doctor.fullName}.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`edit-name-${doctor.id}`}>Name</Label>
              <Input
                id={`edit-name-${doctor.id}`}
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`edit-specialty-${doctor.id}`}>Specialty</Label>
              <Select
                value={specialization}
                onValueChange={(value) =>
                  setSpecialization(
                    value as NonNullable<UpdateDoctorInput["specialization"]>,
                  )
                }
              >
                <SelectTrigger id={`edit-specialty-${doctor.id}`} className="w-full">
                  <SelectValue placeholder="Keep current specialty" />
                </SelectTrigger>
                <SelectContent>
                  {specialties.map((spec) => (
                    <SelectItem key={spec.name} value={spec.name}>
                      {spec.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`edit-department-${doctor.id}`}>Department</Label>
              <Select
                value={departmentId ?? ""}
                onValueChange={setDepartmentId}
              >
                <SelectTrigger id={`edit-department-${doctor.id}`} className="w-full">
                  <SelectValue placeholder="Keep current department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditOpen(false)}
              disabled={updateDoctor.isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={updateDoctor.isPending}>
              {updateDoctor.isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
