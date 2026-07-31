import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, parseApiResponse } from "@/lib/api-client";
import type { ApiResponse, AuthSessionDTO } from "../types/auth.types";
import type { LoginInput } from "../validations/login.schema";

export async function loginUser(input: LoginInput): Promise<ApiResponse<AuthSessionDTO>> {
  const res = await apiClient.api.auth.login.$post({ json: input });
  return parseApiResponse<ApiResponse<AuthSessionDTO>>(res);
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "session"] });
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
}
