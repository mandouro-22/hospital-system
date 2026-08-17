"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, UserMinus } from "lucide-react";
import { toast } from "sonner";
import { usePatient, useUpdatePatientStatus } from "@/features/patients/hooks/use-patients";
import { formatDate, statusVariant } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { UserTableError } from "../components/ui/table-error";

function toDateOnly(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

export default function PatientDetail({ patientId }: { patientId: string }) {
  const {
    data: patientResponse,
    isPending: isPatientPending,
    error: patientError,
  } = usePatient(patientId);
  const updateStatus = useUpdatePatientStatus();
  const [deactivateOpen, setDeactivateOpen] = useState(false);

  if (patientError) {
    return (
      <UserTableError error={patientError.message} title="Failed to load patient" />
    );
  }

  const patient = patientResponse?.data;
  const isInactive = patient?.status === "inactive";

  const handleDeactivate = () => {
    updateStatus.mutate(
      { id: patientId, input: { status: "inactive" } },
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
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {isPatientPending
              ? "Loading patient..."
              : (patient?.fullName ?? "Patient")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {patient?.patientNumber ?? "Patient details"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {patient && !isInactive ? (
            <Button
              variant="destructive"
              onClick={() => setDeactivateOpen(true)}
              disabled={updateStatus.isPending}
            >
              <UserMinus />
              Deactivate patient
            </Button>
          ) : null}
          <Button asChild variant="outline">
            <Link href="/admin/patients">
              <ArrowLeft />
              Back to patients
            </Link>
          </Button>
        </div>
      </div>

      {isPatientPending ? (
        <Card>
          <CardContent className="space-y-4 p-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-4 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : patient ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Core profile details for {patient.fullName}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2">
                <DetailItem label="Patient Number" value={patient.patientNumber} />
                <DetailItem label="PHN" value={patient.phn} />
                <DetailItem label="Full Name" value={patient.fullName} />
                <DetailItem label="Email" value={patient.email} />
                <DetailItem label="Phone" value={patient.phone ?? "—"} />
                <DetailItem label="Gender" value={patient.gender ?? "—"} />
                <DetailItem
                  label="Date of Birth"
                  value={toDateOnly(patient.dateOfBirth)}
                />
                <DetailItem
                  label="Address"
                  value={patient.address ?? "—"}
                />
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Registration Information</CardTitle>
              <CardDescription>
                How and when this patient was registered.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2">
                <DetailItem
                  label="Registration Date"
                  value={formatDate(patient.registrationDate)}
                />
                <DetailItem
                  label="Registered By"
                  value={patient.registeredByName ?? "—"}
                />
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Account status for the patient&apos;s hospital account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-muted-foreground">Account Status</dt>
                  <dd>
                    <Badge variant={statusVariant(patient.status)}>
                      {patient.status.charAt(0).toUpperCase() +
                        patient.status.slice(1)}
                    </Badge>
                  </dd>
                </div>
                <DetailItem
                  label="Created At"
                  value={formatDate(patient.registrationDate)}
                />
                <DetailItem
                  label="Updated At"
                  value={formatDate(patient.updatedAt)}
                />
              </dl>
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
        </div>
      )}

      <Dialog open={deactivateOpen} onOpenChange={setDeactivateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate patient?</DialogTitle>
            <DialogDescription>
              This will mark{" "}
              <span className="font-medium text-foreground">
                {patient?.fullName}
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
    </div>
  );
}