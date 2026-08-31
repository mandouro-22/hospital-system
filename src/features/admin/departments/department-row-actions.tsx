"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Eye, Shield, ShieldAlert } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { useUpdateDepartment, useUpdateDepartmentStatus, useDeleteDepartment } from "@/features/departments/hooks/use-departments";
import type { DepartmentListDTO } from "@/features/departments/types/department.types";

type DepartmentRowActionsProps = {
  department: DepartmentListDTO;
};

export function DepartmentRowActions({ department }: DepartmentRowActionsProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState(department.name);
  const [description, setDescription] = useState(department.description ?? "");
  const updateDepartment = useUpdateDepartment();
  const updateDepartmentStatus = useUpdateDepartmentStatus();
  const deleteDepartment = useDeleteDepartment();

  const openEdit = () => {
    setName(department.name);
    setDescription(department.description ?? "");
    setEditOpen(true);
  };

  const handleUpdate = () => {
    updateDepartment.mutate(
      {
        id: department.id,
        input: { name, description: description || null },
      },
      {
        onSuccess: () => {
          toast.success("Department updated successfully");
          setEditOpen(false);
        },
        onError: (error) => {
          toast.error(error.message);
        },
      },
    );
  };

  const handleStatusChange = (newStatus: "active" | "inactive") => {
    updateDepartmentStatus.mutate(
      { id: department.id, status: newStatus },
      {
        onSuccess: () => {
          toast.success(`Department ${newStatus === "active" ? "activated" : "deactivated"} successfully`);
        },
        onError: (error) => {
          toast.error(error.message);
        },
      },
    );
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${department.name}"? This action cannot be undone.`)) {
      deleteDepartment.mutate(department.id, {
        onSuccess: () => {
          toast.success("Department deleted successfully");
        },
        onError: (error) => {
          toast.error(error.message);
        },
      });
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label="Department actions">
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => router.push(`/admin/departments/${department.id}`)}>
            <Eye />
            View details
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={openEdit}>
            <Pencil />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => handleStatusChange(department.status === "active" ? "inactive" : "active")}
            disabled={updateDepartmentStatus.isPending}
          >
            {department.status === "active" ? (
              <>
                <ShieldAlert />
                Deactivate
              </>
            ) : (
              <>
                <Shield />
                Activate
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteDepartment.isPending}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit department</DialogTitle>
            <DialogDescription>
              Update the details for {department.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`edit-name-${department.id}`}>Name *</Label>
              <Input
                id={`edit-name-${department.id}`}
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={updateDepartment.isPending}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`edit-description-${department.id}`}>Description</Label>
              <Textarea
                id={`edit-description-${department.id}`}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Enter description"
                rows={3}
                disabled={updateDepartment.isPending}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditOpen(false)}
              disabled={updateDepartment.isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={updateDepartment.isPending}>
              {updateDepartment.isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}