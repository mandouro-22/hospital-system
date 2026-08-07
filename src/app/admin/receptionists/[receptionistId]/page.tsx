import React from "react";
import ReceptionistDetail from "@/features/admin/receptionists/receptionist-detail";

export default function ReceptionistDetailPage({
  params,
}: {
  params: { receptionistId: string };
}) {
  return <ReceptionistDetail receptionistId={params.receptionistId} />;
}
