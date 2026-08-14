import React from "react";
import ReceptionistDetail from "@/features/admin/receptionists/receptionist-detail";
import { notFound } from "next/navigation";

export default async function ReceptionistDetailPage({
  params,
}: {
  params: { receptionistId: string };
}) {

  const { receptionistId } = await params;

  return <ReceptionistDetail receptionistId={receptionistId} />;
}
