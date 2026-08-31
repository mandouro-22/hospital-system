import React from "react";
import PatientDetail from "@/features/admin/patients/patient-detail";

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = await params;
  return <PatientDetail patientId={patientId} />;
}