"use client";

import Link from "next/link";
import { ArrowLeft, CalendarDays, Loader2 } from "lucide-react";
import { useDoctor, useDoctorSchedule } from "@/features/doctors/hooks/use-doctors";
import { statusVariant } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { UserTableError } from "../components/ui/table-error";

const DAY_NAMES: Record<number, string> = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
  7: "Sunday",
};

function to12Hour(time: string): string {
  const [hour, minute] = time.split(":").map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return time;
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${String(minute).padStart(2, "0")} ${suffix}`;
}

export default function DoctorDetail({ doctorId }: { doctorId: string }) {
  const {
    data: doctorResponse,
    isPending: isDoctorPending,
    error: doctorError,
  } = useDoctor(doctorId);
  const {
    data: scheduleResponse,
    isPending: isSchedulePending,
  } = useDoctorSchedule(doctorId);

  if (doctorError) {
    return (
      <UserTableError
        error={doctorError.message}
        title="Failed to load doctor"
      />
    );
  }

  const doctor = doctorResponse?.data;
  const schedule = scheduleResponse?.data ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {isDoctorPending ? "Loading doctor..." : (doctor?.fullName ?? "Doctor")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {doctor?.doctorNumber ?? "Doctor details"}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/doctors">
            <ArrowLeft />
            Back to doctors
          </Link>
        </Button>
      </div>

      {isDoctorPending ? (
        <Card>
          <CardContent className="space-y-4 p-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-4 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : doctor ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Doctor Information</CardTitle>
              <CardDescription>
                Core profile details for {doctor.fullName}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-muted-foreground">Doctor Number</dt>
                  <dd className="font-medium">{doctor.doctorNumber}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Email</dt>
                  <dd className="font-medium">{doctor.email}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Specialty</dt>
                  <dd className="font-medium">{doctor.specialization}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Department</dt>
                  <dd className="font-medium">
                    {doctor.departmentName ?? "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">
                    License Number
                  </dt>
                  <dd className="font-medium">{doctor.licenseNumber}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">
                    Consultation Duration
                  </dt>
                  <dd className="font-medium">
                    {doctor.consultationDuration}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Status</dt>
                  <dd>
                    <Badge variant={statusVariant(doctor.status)}>
                      {doctor.status.charAt(0).toUpperCase() +
                        doctor.status.slice(1)}
                    </Badge>
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="size-4" />
                Schedule
              </CardTitle>
              <CardDescription>
                Weekly availability for {doctor.fullName}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSchedulePending ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-10 w-full" />
                  ))}
                </div>
              ) : schedule.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No schedule has been configured for this doctor yet.
                </p>
              ) : (
                <ul className="divide-y">
                  {schedule.map((entry) => (
                    <li
                      key={entry.id}
                      className="flex items-center justify-between py-3"
                    >
                      <span className="font-medium">
                        {DAY_NAMES[entry.dayOfWeek] ?? `Day ${entry.dayOfWeek}`}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {to12Hour(entry.startTime)} → {to12Hour(entry.endTime)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
        </div>
      )}
    </div>
  );
}