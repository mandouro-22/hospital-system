import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, parseApiResponse } from "@/lib/api-client";
import type { ApiResponse } from "../types/auth.types";

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await apiClient.api.auth.logout.$post();
      return parseApiResponse<ApiResponse<null>>(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "session"] });
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
}
