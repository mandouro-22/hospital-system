import React from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateUser } from "@/features/auth/hooks/use-users";
import { createUserSchema } from "@/features/auth/validations/create-user.schema";
import type { CreateUserInput } from "@/features/auth/validations/create-user.schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const ROLES = [
  { value: "ADMIN", label: "Admin" },
  { value: "DOCTOR", label: "Doctor" },
  { value: "RECEPTIONIST", label: "Receptionist" },
] as const;

export default function CreateUserForm() {
  const router = useRouter();
  const createUser = useCreateUser();

  const methods = useForm<CreateUserInput>({ resolver: zodResolver(createUserSchema) });

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = methods;

  const selectedRole = watch("role");

  const onSubmit = async (data: CreateUserInput) => {
    try {
      await createUser.mutateAsync(data);
      toast.success("User created successfully");
      router.push("/admin/users");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create user";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Add New User</CardTitle>
          <CardDescription>
            Create a new hospital staff user. Required fields are marked with
            <span className="text-red-500"> * </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Controller
                      name="name"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="firstName"
                          placeholder="Enter first name"
                          disabled={isSubmitting}
                        />
                      )}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Controller
                      name="email"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="email"
                          type="email"
                          placeholder="Enter email address"
                          disabled={isSubmitting}
                        />
                      )}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Controller
                      name="phone"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="phone"
                          placeholder="Enter phone number"
                          disabled={isSubmitting}
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Role *</Label>
                    <Controller
                      name="role"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger>
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
                      <p className="text-sm text-red-500">
                        {errors.role.message}
                      </p>
                    )}
                  </div>
                </div>

                {(selectedRole === "DOCTOR" || selectedRole === "RECEPTIONIST") && (
                  <div className="space-y-2">
                    <Label htmlFor="departmentId">Department ID *</Label>
                    <Controller
                      name="departmentId"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="departmentId"
                          placeholder="Enter department ID"
                          disabled={isSubmitting}
                        />
                      )}
                    />
                    {errors.departmentId && (
                      <p className="text-sm text-red-500">
                        {errors.departmentId.message}
                      </p>
                    )}
                  </div>
                )}

                {(selectedRole === "DOCTOR" || selectedRole === "RECEPTIONIST") && (
                  <div className="space-y-2">
                    <Label htmlFor="employeeCode">Employee Code *</Label>
                    <Controller
                      name="employeeCode"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="employeeCode"
                          placeholder="Enter employee code"
                          disabled={isSubmitting}
                        />
                      )}
                    />
                    {errors.employeeCode && (
                      <p className="text-sm text-red-500">
                        {errors.employeeCode.message}
                      </p>
                    )}
                  </div>
                )}

                {(selectedRole === "RECEPTIONIST") && (
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Title *</Label>
                    <Controller
                      name="jobTitle"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="jobTitle"
                          placehold
