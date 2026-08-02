"use client";

import { RefreshCw, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

export function UserTableEmpty({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <Inbox className="size-6 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="font-medium">No users found</p>
        <p className="text-sm text-muted-foreground">
          Try adjusting your search or filters to find what you&apos;re looking
          for.
        </p>
      </div>
      <Button variant="outline" onClick={onRefresh}>
        <RefreshCw />
        Reset view
      </Button>
    </div>
  );
}