import type { Context } from "hono";
import type { ApiResponse, ApiPaginatedResponse } from "@/features/auth/types/auth.types";

export function success<T>(c: Context, data: T, message = "Success", status: 200 | 201 = 200): Response {
  const body: ApiResponse<T> = { success: true, message, data };
  return c.json(body, status);
}

export function created<T>(c: Context, data: T, message = "Created successfully"): Response {
  return success(c, data, message, 201);
}

export function paginated<T>(
  c: Context,
  data: T[],
  pagination: { page: number; limit: number; total: number; totalPages: number },
): Response {
  const body: ApiPaginatedResponse<T> = { success: true, data, pagination };
  return c.json(body);
}