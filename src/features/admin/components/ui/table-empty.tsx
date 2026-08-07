"use client";

import { RefreshCw, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

export function UserTableEmpty({
  onRefresh,
  title = "No users found",
  description = "Try adjusting your search or filters to find what you\u2019re looking for.",
}: {
  onRefresh: () => void;
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <Inbox className="size-6 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Button variant="outline" onClick={onRefresh}>
        <RefreshCw />
        Reset view
      </Button>
    </div>
  );
}