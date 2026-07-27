import z from "zod";
export const loginSchema = z.object({
  email: z
    .string({
      error: "Email is required.",
    })
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address.")
    .max(255),

  password: z
    .string({
      error: "Password is required.",
    })
    .min(1, "Password is required.")
    .max(128),
});
export type loginSchemaTypes = z.infer<typeof loginSchema>;
