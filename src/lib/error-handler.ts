import type { Context } from "hono";
import { AppError } from "./errors";
import type { ApiError } from "@/features/auth/types/auth.types";

export function errorHandler(err: Error, c: Context): Response {
  if (err instanceof AppError) {
    const body: ApiError = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
    };
    const code = err.statusCode as 400 | 401 | 403 | 404 | 409 | 422 | 500;
    return c.json(body, code);
  }

  if (err instanceof SyntaxError) {
    return c.json(
      {
        success: false,
        error: { code: "INVALID_JSON", message: "Invalid JSON in request body" },
      } satisfies ApiError,
      400,
    );
  }

  console.error("Unhandled error:", err);
  return c.json(
    {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" },
    } satisfies ApiError,
    500,
  );
}