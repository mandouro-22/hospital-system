"use client";

import { RefreshCw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export function UserTableError({
  error,
  title = "Failed to load users",
}: {
  error?: string | null;
  title?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
        <TriangleAlert className="size-6 text-destructive" />
      </div>
      <div className="space-y-1">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">
          {error ?? "Something went wrong while fetching the user list."}
        </p>
      </div>
      <Button variant="outline" onClick={() => window.location.reload()}>
        <RefreshCw />
        Reload page
      </Button>
    </div>
  );
}