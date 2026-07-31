import { useQuery } from "@tanstack/react-query";
import { apiClient, parseApiResponse } from "@/lib/api-client";
import type { ApiResponse, AuthenticatedUserDTO } from "../types/auth.types";

export function useMe() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const res = await apiClient.api.auth.me.$get();
      const body = await parseApiResponse<ApiResponse<AuthenticatedUserDTO> | { success: true; data: null }>(res);
      return body.data;
    },
  });
}
