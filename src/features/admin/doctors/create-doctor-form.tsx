"use client";

import { Controller, FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useCreateUser } from "@/features/auth/hooks/use-users";
import { useActiveDepartments } from "@/features/departments/hooks/use-departments";
import { useActiveSpecialties } from "@/features/specialties/hooks/use-specialties";
import {
  CONSULTATION_DURATIONS,
  JOB_TITLES,
} from "@/features/auth/constants/staff-options";
import { createUserSchema } from "@/features/auth/validations/create-user.schema";
import type { CreateUserInput } from "@/features/auth/validations/create-user.schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createDoctorSchema,
  createDoctorValues,
} from "@/features/doctors/validations/doctor.schema";

export default function CreateDoctorForm() {
  const router = useRouter();
  const createUser = useCreateUser();
  const {
    data: departmentsResponse,
    isPending: isDepartmentsLoading,
    error: departmentsError,
  } = useActiveDepartments();
  const {
    data: specialtiesResponse,
    isPending: isSpecialtiesLoading,
    error: specialtiesError,
  } = useActiveSpecialties();
  const departments = departmentsResponse?.data ?? [];
  const specialties = specialtiesResponse?.data ?? [];

  const methods = useForm<createDoctorValues>({
    resolver: zodResolver(createDoctorSchema),
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const departmentsUnavailable =
    !departments.length || Boolean(departmentsError);

  const specialtiesUnavailable =
    !specialties.length || Boolean(specialtiesError);

  const onSubmit = async (values: createDoctorValues) => {
    try {
      const input = createUserSchema.parse({
        ...values,
        role: "Doctor",
      } as unknown as CreateUserInput);
      const result = await createUser.mutateAsync(input);
      const doctorNumber = result.data.doctorNumber;
      toast.success(
        doctorNumber
          ? `Doctor created successfully. Doctor number: ${doctorNumber}`
          : "Doctor created successfully",
      );
      router.push("/admin/doctors");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create doctor";
      toast.error(errorMessage);
    }
  };

  const renderField = (
    name: keyof createDoctorValues,
    label: string,
    type: string = "text",
    placeholder: string,
  ) => (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            value={field.value ?? ""}
            id={name}
            type={type}
            placeholder={placeholder}
            disabled={isSubmitting}
          />
        )}
      />
      {errors[name] && (
        <p className="text-sm text-destructive">{errors[name].message}</p>
      )}
    </div>
  );

  const renderSelect = (
    name:
      | "departmentId"
      | "jobTitle"
      | "specialization"
      | "consultationDuration",
    label: string,
    options: readonly { value: string; label: string }[],
    placeholder: string,
  ) => (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select
            onValueChange={field.onChange}
            value={field.value as string | undefined}
            disabled={
              isSubmitting || (name === "departmentId" && isDepartmentsLoading)
            }
          >
            <SelectTrigger id={name}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      {errors[name] && (
        <p className="text-sm text-destructive">{errors[name].message}</p>
      )}
    </div>
  );

  const departmentOptions = departments.map((department) => ({
    value: department.id,
    label: department.name,
  }));

  const specialtyOptions = specialties.map((specialty) => ({
    value: specialty.name,
    label: specialty.name,
  }));

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Add New Doctor</CardTitle>
          <CardDescription>
            Register a doctor account. The doctor number is generated by the
            system. Required fields are marked with
            <span className="text-destructive"> * </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {renderField("name", "Full Name *", "text", "Enter full name")}
                {renderField(
                  "email",
                  "Email *",
                  "email",
                  "Enter email address",
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {renderField(
                  "password",
                  "Password *",
                  "password",
                  "Enter password",
                )}
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" value="Doctor" disabled />
                </div>
              </div>

              <div className="space-y-6 rounded-lg border p-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Staff Details
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {renderSelect(
                    "departmentId",
                    "Department *",
                    departmentOptions,
                    isDepartmentsLoading
                      ? "Loading departments..."
                      : "Select a department",
                  )}
                  {renderField(
                    "employeeCode",
                    "Employee Code *",
                    "text",
                    "Enter employee code",
                  )}
                  {renderSelect(
                    "jobTitle",
                    "Job Title *",
                    JOB_TITLES.map((value) => ({ value, label: value })),
                    "Select a job title",
                  )}
                  {renderField("hireDate", "Hire Date *", "date", "")}
                </div>
                {departmentsError && (
                  <p className="text-sm text-destructive">
                    Unable to load departments. Please try again.
                  </p>
                )}
                {!isDepartmentsLoading &&
                  !departmentsError &&
                  !departments.length && (
                    <p className="text-sm text-destructive">
                      No departments are available. Seed departments before
                      creating doctors.
                    </p>
                  )}
                {specialtiesError && (
                  <p className="text-sm text-destructive">
                    Unable to load specialties. Please try again.
                  </p>
                )}
                {!isSpecialtiesLoading &&
                  !specialtiesError &&
                  !specialties.length && (
                    <p className="text-sm text-destructive">
                      No specialties are available. Seed specialties before
                      creating doctors.
                    </p>
                  )}
              </div>

              <div className="space-y-6 rounded-lg border p-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Medical Details
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {renderSelect(
                    "specialization",
                    "Specialty *",
                    specialtyOptions,
                    isSpecialtiesLoading
                      ? "Loading specialties..."
                      : "Select a specialty",
                  )}
                  {renderField(
                    "licenseNumber",
                    "License Number *",
                    "text",
                    "Enter license number",
                  )}
                  {renderSelect(
                    "consultationDuration",
                    "Consultation Duration *",
                    CONSULTATION_DURATIONS.map((value) => ({
                      value,
                      label: value,
                    })),
                    "Select a duration",
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/admin/doctors")}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || departmentsUnavailable || specialtiesUnavailable}
                >
                  {isSubmitting && (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  )}
                  Create Doctor
                </Button>
              </div>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  );
}
