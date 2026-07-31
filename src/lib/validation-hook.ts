import type { Context } from "hono";
import type { ApiError } from "@/features/auth/types/auth.types";

type ZodFlattenedResult = {
  formErrors: string[];
  fieldErrors: Record<string, string[] | undefined>;
};

export function zodValidationHook(
  result: {
    success: boolean;
    error?: { flatten(): ZodFlattenedResult };
  },
  c: Context,
) {
  if (!result.success) {
    return c.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details: result.error?.flatten().fieldErrors as Record<string, string[]> | undefined,
        },
      } satisfies ApiError,
      422,
    );
  }
}
