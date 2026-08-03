"use client";

import React from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { useCreateUser } from "@/features/auth/hooks/use-users";
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

const ROLES = [
  { value: "Admin", label: "Admin" },
  { value: "Doctor", label: "Doctor" },
  { value: "Receptionist", label: "Receptionist" },
] as const;

const formSchema = z.object({
  name: z.string().trim().min(2).max(200),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().trim().min(8).max(255),
  role: z.enum(["Admin", "Doctor", "Receptionist"]),
  departmentId: z.string().trim().min(1).optional(),
  employeeCode: z.string().trim().min(2).max(50).optional(),
  jobTitle: z.string().trim().min(2).max(100).optional(),
  hireDate: z.string().optional(),
  specialization: z.string().trim().min(2).max(100).optional(),
  licenseNumber: z.string().trim().min(2).max(50).optional(),
  consultationDuration: z.string().trim().min(1).max(20).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateUserForm() {
  const router = useRouter();
  const createUser = useCreateUser();

  const methods = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = methods;

  const selectedRole = watch("role");

  const showStaffFields = selectedRole === "Doctor" || selectedRole === "Receptionist";

  const onSubmit = async (values: FormValues) => {
    try {
      const input = createUserSchema.parse(values as CreateUserInput);
      await createUser.mutateAsync(input);
      toast.success("User created successfully");
      router.push("/admin/users");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create user";
      toast.error(errorMessage);
    }
  };

  const renderField = (
    name: keyof FormValues,
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

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Add New User</CardTitle>
          <CardDescription>
            Create a new hospital staff user. Required fields are marked with
            <span className="text-destructive"> * </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {renderField("name", "Full Name *", "text", "Enter full name")}
                {renderField("email", "Email *", "email", "Enter email address")}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {renderField("password", "Password *", "password", "Enter password")}

                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger id="role">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLES.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.role && (
                    <p className="text-sm text-destructive">
                      {errors.role.message}
                    </p>
                  )}
                </div>
              </div>

              {showStaffFields && (
                <div className="space-y-6 rounded-lg border p-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Staff Details
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {renderField(
                      "departmentId",
                      "Department ID *",
                      "text",
                      "Enter department ID",
                    )}
                    {renderField(
                      "employeeCode",
                      "Employee Code *",
                      "text",
                      "Enter employee code",
                    )}
                    {renderField(
                      "jobTitle",
                      "Job Title *",
                      "text",
                      "Enter job title",
                    )}
                    {renderField("hireDate", "Hire Date *", "date", "")}
                  </div>
                </div>
              )}

              {selectedRole === "Doctor" && (
                <div className="space-y-6 rounded-lg border p-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Medical Details
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {renderField(
                      "specialization",
                      "Specialization *",
                      "text",
                      "Enter specialization",
                    )}
                    {renderField(
                      "licenseNumber",
                      "License Number *",
                      "text",
                      "Enter license number",
                    )}
                    {renderField(
                      "consultationDuration",
                      "Consultation Duration *",
                      "text",
                      "e.g. 30 mins",
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/admin/users")}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                  Create User
                </Button>
              </div>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  );
}
