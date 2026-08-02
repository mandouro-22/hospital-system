"use client";

import { Skeleton } from "@/components/ui/skeleton";

type SkeletonColumn = {
  key: string;
  label: string;
  sortable: boolean;
};

export function UserTableSkeleton({ columns }: { columns: SkeletonColumn[] }) {
  return (
    <div className="flex flex-col gap-3 p-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="flex items-center gap-4">
          <Skeleton className="size-8 shrink-0 rounded-full" />
          <div className="flex flex-1 gap-4">
            {columns.map((column) => (
              <Skeleton key={column.key} className="h-4 flex-1" />
            ))}
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}