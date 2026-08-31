"use client";

import { Controller, FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useCreateSpecialty } from "@/features/specialties/hooks/use-specialties";
import {
  createSpecialtySchema,
  type CreateSpecialtyFormInput,
  type CreateSpecialtyInput,
} from "@/features/specialties/validations/specialty.schema";
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

export default function CreateSpecialtyForm() {
  const router = useRouter();
  const createSpecialty = useCreateSpecialty();

  const methods = useForm<
    CreateSpecialtyFormInput,
    unknown,
    CreateSpecialtyInput
  >({
    resolver: zodResolver(createSpecialtySchema),
    defaultValues: {
      status: "active",
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const onSubmit = async (values: CreateSpecialtyInput) => {
    try {
      await createSpecialty.mutateAsync(values);
      toast.success("Specialty created successfully");
      router.push("/admin/specialties");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create specialty";
      toast.error(errorMessage);
    }
  };

  const renderField = (
    name: keyof CreateSpecialtyFormInput,
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
    name: keyof CreateSpecialtyFormInput,
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
    name: keyof CreateSpecialtyFormInput,
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
          <CardTitle>Add New Specialty</CardTitle>
          <CardDescription>
            Create a new specialty. Required fields are marked with
            <span className="text-destructive"> * </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {renderField("name", "Name *", "text", "Enter specialty name")}
              </div>

              {renderTextarea("description", "Description", "Enter description")}

              <div className="space-y-6 rounded-lg border p-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Status
                </p>
                {renderSelect("status", "Status", statusOptions, "Select status")}
              </div>

              <div className="flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/admin/specialties")}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  )}
                  Create Specialty
                </Button>
              </div>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  );
}
