"use client";

import Link from "next/link";
import { ArrowLeft, BriefcaseMedical, Loader2, Users } from "lucide-react";
import { useSpecialty } from "@/features/specialties/hooks/use-specialties";
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

export default function SpecialtyDetail({ specialtyId }: { specialtyId: string }) {
  const {
    data: specialtyResponse,
    isPending: isSpecialtyPending,
    error: specialtyError,
  } = useSpecialty(specialtyId);

  if (specialtyError) {
    return (
      <UserTableError
        error={specialtyError.message}
        title="Failed to load specialty"
      />
    );
  }

  const specialty = specialtyResponse?.data;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BriefcaseMedical className="size-6 text-chart-3" />
            {isSpecialtyPending ? "Loading specialty..." : (specialty?.name ?? "Specialty")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {specialty?.id ?? "Specialty details"}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/specialties">
            <ArrowLeft />
            Back to specialties
          </Link>
        </Button>
      </div>

      {isSpecialtyPending ? (
        <Card>
          <CardContent className="space-y-4 p-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-4 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : specialty ? (
        <Card>
          <CardHeader>
            <CardTitle>Specialty Information</CardTitle>
            <CardDescription>
              Core details for {specialty.name}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">ID</dt>
                <dd className="font-medium font-mono text-sm">{specialty.id}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Status</dt>
                <dd>
                  <Badge variant={statusVariant(specialty.status)}>
                    {specialty.status.charAt(0).toUpperCase() + specialty.status.slice(1)}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Description</dt>
                <dd className="font-medium">{specialty.description ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Doctors Assigned</dt>
                <dd className="font-medium flex items-center gap-1">
                  <Users className="size-4" />
                  {specialty.doctorCount}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-muted-foreground">Created At</dt>
                <dd className="font-medium">
                  {new Date(specialty.createdAt).toLocaleString()}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-muted-foreground">Updated At</dt>
                <dd className="font-medium">
                  {new Date(specialty.updatedAt).toLocaleString()}
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