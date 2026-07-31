import type { Context, TypedResponse } from "hono";
import type { ApiResponse, ApiPaginatedResponse } from "@/features/auth/types/auth.types";

export function success<T>(
  c: Context,
  data: T,
  message = "Success",
  status: 200 | 201 = 200,
): TypedResponse<ApiResponse<T>, 200 | 201> {
  const body: ApiResponse<T> = { success: true, message, data };
  return c.json(body, status) as unknown as TypedResponse<ApiResponse<T>, 200 | 201>;
}

export function created<T>(
  c: Context,
  data: T,
  message = "Created successfully",
): TypedResponse<ApiResponse<T>, 201> {
  return c.json({ success: true, message, data } satisfies ApiResponse<T>, 201) as unknown as TypedResponse<
    ApiResponse<T>,
    201
  >;
}

export function paginated<T>(
  c: Context,
  data: T[],
  pagination: { page: number; limit: number; total: number; totalPages: number },
): TypedResponse<ApiPaginatedResponse<T>> {
  const body: ApiPaginatedResponse<T> = { success: true, data, pagination };
  return c.json(body) as unknown as TypedResponse<ApiPaginatedResponse<T>>;
}