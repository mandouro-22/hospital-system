import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, parseApiResponse } from "@/lib/api-client";
import type { ApiPaginatedResponse, ApiResponse, SanitizedUserDTO } from "../types/auth.types";
import type { PaginationInput } from "../validations/pagination.schema";
import type { CreateUserInput } from "../validations/create-user.schema";
import type { UpdateUserInput } from "../validations/update-user.schema";

export function useUsers(params: PaginationInput) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: async () => {
      const res = await apiClient.api.users.$get({ query: params });
      return parseApiResponse<ApiPaginatedResponse<SanitizedUserDTO>>(res);
    },
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ["users", id],
    queryFn: async () => {
      const res = await apiClient.api.users[":id"].$get({ param: { id } });
      return parseApiResponse<ApiResponse<SanitizedUserDTO>>(res);
    },
    enabled: Boolean(id),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateUserInput) => {
      const res = await apiClient.api.users.$post({ json: input });
      return parseApiResponse<ApiResponse<SanitizedUserDTO>>(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateUserInput }) => {
      const res = await apiClient.api.users[":id"].$patch({ param: { id }, json: input });
      return parseApiResponse<ApiResponse<SanitizedUserDTO>>(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.api.users[":id"].$delete({ param: { id } });
      return parseApiResponse<ApiResponse<null>>(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
