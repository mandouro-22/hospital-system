"use client";

import Link from "next/link";
import { ArrowLeft, CalendarDays, Loader2 } from "lucide-react";
import { useReceptionist } from "@/features/receptionists/hooks/use-receptionists";
import { statusVariant } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { UserTableError } from "../components/ui/table-error";

export default function ReceptionistDetail({
  receptionistId,
}: {
  receptionistId: string;
}) {
  const {
    data: receptionistResponse,
    isPending: isReceptionistPending,
    error: receptionistError,
  } = useReceptionist(receptionistId);

  if (receptionistError) {
    return (
      <UserTableError
        error={receptionistError.message}
        title="Failed to load receptionist"
      />
    );
  }

  const receptionist = receptionistResponse?.data;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {isReceptionistPending
              ? "Loading receptionist..."
              : (receptionist?.fullName ?? "Receptionist")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {receptionist?.receptionistNumber ?? "Receptionist details"}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/receptionists">
            <ArrowLeft />
            Back to receptionists
          </Link>
        </Button>
      </div>

      {isReceptionistPending ? (
        <Card>
          <CardContent className="space-y-4 p-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-4 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : receptionist ? (
        <Card>
          <CardHeader>
            <CardTitle>Receptionist Information</CardTitle>
            <CardDescription>
              Core profile details for {receptionist.fullName}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">
                  Receptionist Number
                </dt>
                <dd className="font-medium">
                  {receptionist.receptionistNumber}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Email</dt>
                <dd className="font-medium">{receptionist.email}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Department</dt>
                <dd className="font-medium">
                  {receptionist.departmentName ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Job Title</dt>
                <dd className="font-medium">{receptionist.jobTitle ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Employee Code</dt>
                <dd className="font-medium">
                  {receptionist.employeeCode ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Status</dt>
                <dd>
                  <Badge variant={statusVariant(receptionist.status)}>
                    {receptionist.status.charAt(0).toUpperCase() +
                      receptionist.status.slice(1)}
                  </Badge>
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      ) : (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
        </div>
      )}
    </div>
  );
}
