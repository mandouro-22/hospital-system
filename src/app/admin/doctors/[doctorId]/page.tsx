import React from "react";
import DoctorDetail from "@/features/admin/doctors/doctor-detail";

export default async function DoctorDetailPage({
  params,
}: {
  params: Promise<{ doctorId: string }>;
}) {
  const { doctorId } = await params;
  return <DoctorDetail doctorId={doctorId} />;
}