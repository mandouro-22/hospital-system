import { hc } from "hono/client";
import type { AppType } from "@/services/routes";
import type { ApiError } from "@/features/auth/types/auth.types";

export const apiClient = hc<AppType>("/");

export class ApiClientError extends Error {
  constructor(
    public status: number | undefined,
    public code: string,
    message: string,
    public details?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

export async function parseApiResponse<T>(res: {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}): Promise<T> {
  const body = (await res.json()) as T | ApiError;

  if (!res.ok || (typeof body === "object" && body !== null && "error" in body)) {
    const error = (body as ApiError | null)?.error ?? {
      code: "UNKNOWN_ERROR",
      message: "Request failed",
    };
    throw new ApiClientError(res.status, error.code, error.message, error.details);
  }

  return body as T;
}
