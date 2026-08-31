"use client";

import { Controller, FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useCreateDepartment } from "@/features/departments/hooks/use-departments";
import {
  createDepartmentSchema,
  type CreateDepartmentInput,
} from "@/features/departments/validations/department.schema";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CreateDepartmentForm() {
  const router = useRouter();
  const createDepartment = useCreateDepartment();

  const methods = useForm<CreateDepartmentInput>({
    resolver: zodResolver(createDepartmentSchema),
    defaultValues: {
      status: "active",
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const onSubmit = async (values: CreateDepartmentInput) => {
    try {
      await createDepartment.mutateAsync(values);
      toast.success("Department created successfully");
      router.push("/admin/departments");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create department";
      toast.error(errorMessage);
    }
  };

  const renderField = (
    name: keyof CreateDepartmentInput,
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

  const renderTextarea = (
    name: keyof CreateDepartmentInput,
    label: string,
    placeholder: string,
  ) => (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Textarea
            {...field}
            value={field.value ?? ""}
            id={name}
            placeholder={placeholder}
            rows={4}
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
    name: keyof CreateDepartmentInput,
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
            disabled={isSubmitting}
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

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Add New Department</CardTitle>
          <CardDescription>
            Create a new department. Required fields are marked with
            <span className="text-destructive"> * </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {renderField("name", "Name *", "text", "Enter department name")}
              </div>

              {renderTextarea(
                "description",
                "Description",
                "Enter description",
              )}

              <div className="space-y-6 rounded-lg border p-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Status
                </p>
                {renderSelect(
                  "status",
                  "Status",
                  statusOptions,
                  "Select status",
                )}
              </div>

              <div className="flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/admin/departments")}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  )}
                  Create Department
                </Button>
              </div>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  );
}
