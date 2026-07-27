"use client";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldSet,
  FieldContent,
} from "@/components/ui/field";
import { loginSchema } from "../schema/auth";
import { Input } from "@/components/ui/input";

export function Login() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: { email: string; password: string }) => {
    // TODO: integrate with TanStack Query later
    console.log("Login data:", data);
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Sign in</h2>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FieldSet>
          <div>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Field orientation="horizontal">
                  <FieldContent>
                    <Input
                      id="email"
                      type="email"
                      {...field}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                      placeholder="you@example.com"
                    />
                    {errors.email && (
                      <FieldError>{errors.email.message}</FieldError>
                    )}
                  </FieldContent>
                </Field>
              )}
            />
          </div>

          <div>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Field orientation="horizontal">
                  <FieldContent>
                    <Input
                      id="password"
                      type="password"
                      {...field}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                      placeholder="••••••••"
                    />
                    {errors.password && (
                      <FieldError>{errors.password.message}</FieldError>
                    )}
                  </FieldContent>
                </Field>
              )}
            />
          </div>
        </FieldSet>

        <Button
          type="submit"
          className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary-600 my-2"
        >
          Sign in
        </Button>
      </form>
    </div>
  );
}
