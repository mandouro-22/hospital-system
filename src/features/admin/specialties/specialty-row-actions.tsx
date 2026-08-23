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
import { useUpdateSpecialty, useUpdateSpecialtyStatus, useDeleteSpecialty } from "@/features/specialties/hooks/use-specialties";
import type { SpecialtyListDTO } from "@/features/specialties/types/specialty.types";

type SpecialtyRowActionsProps = {
  specialty: SpecialtyListDTO;
};

export function SpecialtyRowActions({ specialty }: SpecialtyRowActionsProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState(specialty.name);
  const [description, setDescription] = useState(specialty.description ?? "");
  const updateSpecialty = useUpdateSpecialty();
  const updateSpecialtyStatus = useUpdateSpecialtyStatus();
  const deleteSpecialty = useDeleteSpecialty();

  const openEdit = () => {
    setName(specialty.name);
    setDescription(specialty.description ?? "");
    setEditOpen(true);
  };

  const handleUpdate = () => {
    updateSpecialty.mutate(
      {
        id: specialty.id,
        input: { name, description: description || null },
      },
      {
        onSuccess: () => {
          toast.success("Specialty updated successfully");
          setEditOpen(false);
        },
        onError: (error) => {
          toast.error(error.message);
        },
      },
    );
  };

  const handleStatusChange = (newStatus: "active" | "inactive") => {
    updateSpecialtyStatus.mutate(
      { id: specialty.id, status: newStatus },
      {
        onSuccess: () => {
          toast.success(`Specialty ${newStatus === "active" ? "activated" : "deactivated"} successfully`);
        },
        onError: (error) => {
          toast.error(error.message);
        },
      },
    );
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${specialty.name}"? This action cannot be undone.`)) {
      deleteSpecialty.mutate(specialty.id, {
        onSuccess: () => {
          toast.success("Specialty deleted successfully");
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
          <Button variant="ghost" size="icon-sm" aria-label="Specialty actions">
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => router.push(`/admin/specialties/${specialty.id}`)}>
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
            onClick={() => handleStatusChange(specialty.status === "active" ? "inactive" : "active")}
            disabled={updateSpecialtyStatus.isPending}
          >
            {specialty.status === "active" ? (
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
            disabled={deleteSpecialty.isPending}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit specialty</DialogTitle>
            <DialogDescription>
              Update the details for {specialty.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`edit-name-${specialty.id}`}>Name *</Label>
              <Input
                id={`edit-name-${specialty.id}`}
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={updateSpecialty.isPending}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`edit-description-${specialty.id}`}>Description</Label>
              <Textarea
                id={`edit-description-${specialty.id}`}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Enter description"
                rows={3}
                disabled={updateSpecialty.isPending}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditOpen(false)}
              disabled={updateSpecialty.isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={updateSpecialty.isPending}>
              {updateSpecialty.isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}