"use client";

import Link from "next/link";
import { ArrowLeft, Building2, Loader2, Users } from "lucide-react";
import { useDepartment } from "@/features/departments/hooks/use-departments";
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

export default function DepartmentDetail({ departmentId }: { departmentId: string }) {
  const {
    data: departmentResponse,
    isPending: isDepartmentPending,
    error: departmentError,
  } = useDepartment(departmentId);

  if (departmentError) {
    return (
      <UserTableError
        error={departmentError.message}
        title="Failed to load department"
      />
    );
  }

  const department = departmentResponse?.data;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="size-6 text-primary" />
            {isDepartmentPending ? "Loading department..." : (department?.name ?? "Department")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {department?.id ?? "Department details"}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/departments">
            <ArrowLeft />
            Back to departments
          </Link>
        </Button>
      </div>

      {isDepartmentPending ? (
        <Card>
          <CardContent className="space-y-4 p-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-4 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : department ? (
        <Card>
          <CardHeader>
            <CardTitle>Department Information</CardTitle>
            <CardDescription>
              Core details for {department.name}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">ID</dt>
                <dd className="font-medium font-mono text-sm">{department.id}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Status</dt>
                <dd>
                  <Badge variant={statusVariant(department.status)}>
                    {department.status.charAt(0).toUpperCase() + department.status.slice(1)}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Description</dt>
                <dd className="font-medium">{department.description ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Doctors Assigned</dt>
                <dd className="font-medium flex items-center gap-1">
                  <Users className="size-4" />
                  {department.doctorCount}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-muted-foreground">Created At</dt>
                <dd className="font-medium">
                  {new Date(department.createdAt).toLocaleString()}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-muted-foreground">Updated At</dt>
                <dd className="font-medium">
                  {new Date(department.updatedAt).toLocaleString()}
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