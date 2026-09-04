"use client";

import { useState } from "react";
import { Ban, CalendarOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useDisableAppointmentDate,
  useDisabledAppointmentDates,
  useEnableAppointmentDate,
} from "@/features/appointments/hooks/use-appointments";
import { formatCalendarDate } from "./appointment-table";

function todayIsoDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function DisabledDatesCard() {
  const { data, isPending, error } = useDisabledAppointmentDates();
  const disableDate = useDisableAppointmentDate();
  const enableDate = useEnableAppointmentDate();
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");

  const handleDisable = () => {
    if (!date) {
      toast.error("Select a date to disable");
      return;
    }

    if (!confirm(`Disable appointments on ${formatCalendarDate(date)}? Staff will not be able to book this date.`)) {
      return;
    }

    disableDate.mutate(
      { date, reason: reason.trim() || null },
      {
        onSuccess: () => {
          toast.success("Date disabled for appointments");
          setDate("");
          setReason("");
        },
        onError: (disableError) => toast.error(disableError.message),
      },
    );
  };

  const handleEnable = (id: string, disabledDate: string) => {
    if (!confirm(`Enable appointments on ${formatCalendarDate(disabledDate)} again?`)) {
      return;
    }

    enableDate.mutate(id, {
      onSuccess: () => toast.success("Date enabled for appointments"),
      onError: (enableError) => toast.error(enableError.message),
    });
  };

  const dates = data?.data ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarOff className="size-4" />
          Disable a date
        </CardTitle>
        <CardDescription>
          Block a specific calendar day for the whole hospital, such as a holiday. Weekly closed days still come from Appointment Settings.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-[14rem_1fr_auto] sm:items-end">
          <div className="space-y-2">
            <Label htmlFor="disabled-appointment-date">Date</Label>
            <Input
              id="disabled-appointment-date"
              type="date"
              min={todayIsoDate()}
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="disabled-appointment-reason">Reason (optional)</Label>
            <Input
              id="disabled-appointment-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Public holiday"
              maxLength={500}
            />
          </div>
          <Button onClick={handleDisable} disabled={disableDate.isPending}>
            <Ban />
            {disableDate.isPending ? "Disabling..." : "Disable date"}
          </Button>
        </div>

        {isPending ? (
          <Skeleton className="h-20 w-full" />
        ) : error ? (
          <p className="text-sm text-destructive">Unable to load disabled dates. {error.message}</p>
        ) : dates.length === 0 ? (
          <p className="text-sm text-muted-foreground">No dates are currently disabled.</p>
        ) : (
          <ul className="divide-y rounded-lg border">
            {dates.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 px-3 py-2">
                <div>
                  <p className="text-sm font-medium">{formatCalendarDate(item.disabledDate)}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.reason || "No reason provided"}
                    {item.createdByName ? ` · ${item.createdByName}` : ""}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={enableDate.isPending}
                  onClick={() => handleEnable(item.id, item.disabledDate)}
                >
                  Enable
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
