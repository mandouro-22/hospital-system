import React from "react";
import SpecialtyDetail from "@/features/admin/specialties/specialty-detail";

export default async function SpecialtyDetailPage({
  params,
}: {
  params: Promise<{ specialtyId: string }>;
}) {
  const { specialtyId } = await params;
  return <SpecialtyDetail specialtyId={specialtyId} />;
}