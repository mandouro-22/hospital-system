"use client";

import { useState } from "react";
import { MoreHorizontal, Eye, UserMinus } from "lucide-react";
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
import { useUpdatePatientStatus } from "@/features/patients/hooks/use-patients";
import type { PatientListDTO } from "@/features/patients/types/patient.types";

type PatientRowActionsProps = {
  patient: PatientListDTO;
};

export function PatientRowActions({ patient }: PatientRowActionsProps) {
  const router = useRouter();
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const updateStatus = useUpdatePatientStatus();
  const isInactive = patient.status === "inactive";

  const handleDeactivate = () => {
    updateStatus.mutate(
      { id: patient.id, input: { status: "inactive" } },
      {
        onSuccess: () => {
          toast.success("Patient deactivated successfully");
          setDeactivateOpen(false);
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
          <Button variant="ghost" size="icon-sm" aria-label="Patient actions">
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem
            onClick={() => router.push(`/admin/patients/${patient.id}`)}
          >
            <Eye />
            View details
          </DropdownMenuItem>
          {!isInactive ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setDeactivateOpen(true)}
              >
                <UserMinus />
                Deactivate
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={deactivateOpen} onOpenChange={setDeactivateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate patient?</DialogTitle>
            <DialogDescription>
              This will mark{" "}
              <span className="font-medium text-foreground">
                {patient.fullName}
              </span>{" "}
              as inactive. The patient record and historical information will
              not be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeactivateOpen(false)}
              disabled={updateStatus.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeactivate}
              disabled={updateStatus.isPending}
            >
              {updateStatus.isPending ? "Deactivating..." : "Deactivate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}