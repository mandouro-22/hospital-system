"use client";

import { useState } from "react";
import { CalendarClock, Clock3, ShieldCheck, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { CONSULTATION_DURATIONS } from "@/features/auth/constants/staff-options";
import { useAppointmentSettings, useUpdateAppointmentSettings } from "@/features/appointment-settings/hooks/use-appointment-settings";
import type { AppointmentSettingsDTO, AppointmentStatus, HospitalWorkingHour } from "@/features/appointment-settings/types/appointment-settings.types";
import { APPOINTMENT_STATUSES } from "@/features/appointment-settings/validations/appointment-settings.schema";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const STATUS_LABELS: Record<AppointmentStatus, string> = {
  scheduled: "Scheduled",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No show",
};

function SettingsSkeleton() {
  return <div className="space-y-4">{Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-44 w-full" />)}</div>;
}

export default function AppointmentSettingsManagement() {
  const { data, isPending, error } = useAppointmentSettings();
  const updateSettings = useUpdateAppointmentSettings();
  const [settings, setSettings] = useState<AppointmentSettingsDTO | null>(null);

  const currentSettings = settings ?? data?.data ?? null;

  const updateWorkingHour = (dayOfWeek: number, changes: Partial<HospitalWorkingHour>) => {
    setSettings((current) => {
      const source = current ?? data?.data;
      return source ? {
        ...source,
        workingHours: source.workingHours.map((hour) => hour.dayOfWeek === dayOfWeek ? { ...hour, ...changes } : hour),
      } : current;
    });
  };

  const toggleStatus = (status: AppointmentStatus) => {
    setSettings((current) => {
      const source = current ?? data?.data;
      if (!source) return current;
      const enabledStatuses = source.enabledStatuses.includes(status)
        ? source.enabledStatuses.filter((item) => item !== status)
        : [...source.enabledStatuses, status];
      return { ...source, enabledStatuses };
    });
  };

  const handleSave = () => {
    if (!currentSettings) return;
    updateSettings.mutate(currentSettings, {
      onSuccess: () => toast.success("Appointment settings saved"),
      onError: (saveError) => toast.error(saveError.message),
    });
  };

  if (isPending) return <SettingsSkeleton />;
  if (error || !currentSettings) return <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">Unable to load appointment settings. {error?.message}</div>;

  const workingHours = [...currentSettings.workingHours].sort((a, b) => a.dayOfWeek - b.dayOfWeek);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 pb-8">
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-bold"><CalendarClock className="size-6 text-primary" />Appointment Settings</h2>
        <p className="text-sm text-muted-foreground">Configure the rules reception staff will use when appointment booking is introduced.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Clock3 className="size-4" />Default Appointment Duration</CardTitle>
          <CardDescription>Used when a doctor-specific consultation duration is not selected.</CardDescription>
        </CardHeader>
        <CardContent className="max-w-xs">
          <Label htmlFor="default-duration">Duration</Label>
          <Select value={currentSettings.defaultDuration} onValueChange={(defaultDuration) => setSettings({ ...currentSettings, defaultDuration: defaultDuration as AppointmentSettingsDTO["defaultDuration"] })}>
            <SelectTrigger id="default-duration" className="mt-1.5 w-full"><SelectValue /></SelectTrigger>
            <SelectContent>{CONSULTATION_DURATIONS.map((duration) => <SelectItem key={duration} value={duration}>{duration}</SelectItem>)}</SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hospital Working Hours</CardTitle>
          <CardDescription>These define when appointments can generally occur. Doctor schedules remain a separate, per-doctor availability rule.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {workingHours.map((hour) => (
            <div key={hour.dayOfWeek} className="grid items-center gap-3 rounded-md border p-3 sm:grid-cols-[7rem_1fr_1fr_auto]">
              <span className="text-sm font-medium">{DAY_NAMES[hour.dayOfWeek]}</span>
              <Input aria-label={`${DAY_NAMES[hour.dayOfWeek]} start time`} type="time" value={hour.startTime ?? ""} disabled={hour.isClosed} onChange={(event) => updateWorkingHour(hour.dayOfWeek, { startTime: event.target.value || null })} />
              <Input aria-label={`${DAY_NAMES[hour.dayOfWeek]} end time`} type="time" value={hour.endTime ?? ""} disabled={hour.isClosed} onChange={(event) => updateWorkingHour(hour.dayOfWeek, { endTime: event.target.value || null })} />
              <Label className="flex cursor-pointer items-center gap-2 text-sm"><input type="checkbox" checked={hour.isClosed} onChange={(event) => updateWorkingHour(hour.dayOfWeek, { isClosed: event.target.checked, startTime: event.target.checked ? null : "09:00", endTime: event.target.checked ? null : "17:00" })} />Closed</Label>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShieldCheck className="size-4" />Doctor Availability Rule</CardTitle>
          <CardDescription>Appointment slots must be within hospital hours and the doctor&apos;s weekly schedule.</CardDescription>
        </CardHeader>
        <CardContent>
          <Label className="flex cursor-pointer items-start gap-3 rounded-md border p-3 text-sm">
            <input className="mt-0.5" type="checkbox" checked={currentSettings.requireDoctorSchedule} onChange={(event) => setSettings({ ...currentSettings, requireDoctorSchedule: event.target.checked })} />
            <span><span className="block font-medium">Require a doctor schedule before booking</span><span className="text-muted-foreground">Doctor availability is managed from each doctor&apos;s existing schedule.</span></span>
          </Label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appointment Statuses</CardTitle>
          <CardDescription>Select the statuses that will be available to the future appointment workflow. Scheduled and cancelled are required.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {APPOINTMENT_STATUSES.map((status) => {
            const selected = currentSettings.enabledStatuses.includes(status);
            const required = status === "scheduled" || status === "cancelled";
            return <Button key={status} type="button" variant={selected ? "default" : "outline"} aria-pressed={selected} disabled={required} onClick={() => toggleStatus(status)}>{STATUS_LABELS[status]}</Button>;
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><XCircle className="size-4" />Cancellation Rule</CardTitle>
          <CardDescription>Set how much notice is required before an appointment can be cancelled.</CardDescription>
        </CardHeader>
        <CardContent className="max-w-xs">
          <Label htmlFor="cancellation-notice">Minimum notice</Label>
          <Select value={String(currentSettings.cancellationNoticeHours)} onValueChange={(value) => setSettings({ ...currentSettings, cancellationNoticeHours: Number(value) as AppointmentSettingsDTO["cancellationNoticeHours"] })}>
            <SelectTrigger id="cancellation-notice" className="mt-1.5 w-full"><SelectValue /></SelectTrigger>
            <SelectContent>{[0, 2, 4, 12, 24, 48].map((hours) => <SelectItem key={hours} value={String(hours)}>{hours === 0 ? "No minimum notice" : `${hours} hours`}</SelectItem>)}</SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="flex justify-end"><Button onClick={handleSave} disabled={updateSettings.isPending}>{updateSettings.isPending ? "Saving..." : "Save settings"}</Button></div>
    </div>
  );
}
