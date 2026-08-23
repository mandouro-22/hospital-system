import React from "react";
import DepartmentDetail from "@/features/admin/departments/department-detail";

export default async function DepartmentDetailPage({
  params,
}: {
  params: Promise<{ departmentId: string }>;
}) {
  const { departmentId } = await params;
  return <DepartmentDetail departmentId={departmentId} />;
}