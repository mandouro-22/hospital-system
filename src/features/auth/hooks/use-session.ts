import { useQuery } from "@tanstack/react-query";
import { apiClient, parseApiResponse } from "@/lib/api-client";
import type { ApiResponse, AuthSessionDTO } from "../types/auth.types";

export function useSession() {
  return useQuery({
    queryKey: ["auth", "session"],
    queryFn: async () => {
      const res = await apiClient.api.auth.session.$get();
      const body = await parseApiResponse<ApiResponse<AuthSessionDTO> | { success: true; data: null }>(res);
      return body.data;
    },
  });
}
