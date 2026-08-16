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
import { useUpdateReceptionist } from "@/features/receptionists/hooks/use-receptionists";
import { useDepartments } from "@/features/departments/hooks/use-departments";
import type { ReceptionistListDTO } from "@/features/receptionists/types/receptionist.types";

type ReceptionistRowActionsProps = {
  receptionist: ReceptionistListDTO;
};

export function ReceptionistRowActions({
  receptionist,
}: ReceptionistRowActionsProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState(receptionist.fullName);
  const [departmentId, setDepartmentId] = useState<string | null>(
    receptionist.departmentId,
  );
  const updateReceptionist = useUpdateReceptionist();
  const { data: departmentsResponse } = useDepartments();
  const departments = departmentsResponse?.data ?? [];

  const openEdit = () => {
    setName(receptionist.fullName);
    setDepartmentId(receptionist.departmentId);
    setEditOpen(true);
  };

  const handleUpdate = () => {
    updateReceptionist.mutate(
      {
        id: receptionist.id,
        input: {
          name,
          ...(departmentId ? { departmentId } : {}),
        },
      },
      {
        onSuccess: () => {
          toast.success("Receptionist updated successfully");
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
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Receptionist actions"
          >
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem
            onClick={() =>
              router.push(`/admin/receptionists/${receptionist.id}`)
            }
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
            <DialogTitle>Edit receptionist</DialogTitle>
            <DialogDescription>
              Update the details for {receptionist.fullName}.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`edit-name-${receptionist.id}`}>Name</Label>
              <Input
                id={`edit-name-${receptionist.id}`}
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`edit-department-${receptionist.id}`}>
                Department
              </Label>
              <Select
                value={departmentId ?? ""}
                onValueChange={setDepartmentId}
              >
                <SelectTrigger
                  id={`edit-department-${receptionist.id}`}
                  className="w-full"
                >
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
              disabled={updateReceptionist.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={updateReceptionist.isPending}
            >
              {updateReceptionist.isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
