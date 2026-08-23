import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, parseApiResponse } from "@/lib/api-client";
import type { ApiPaginatedResponse, ApiResponse } from "@/features/auth/types/auth.types";
import type { DepartmentListInput, CreateDepartmentInput, UpdateDepartmentInput } from "../validations/department.schema";
import type { DepartmentListDTO, DepartmentDetailDTO, DepartmentOption } from "../types/department.types";

export function useDepartments(params?: DepartmentListInput) {
  return useQuery({
    queryKey: ["departments", params],
    queryFn: async () => {
      const res = await apiClient.api.departments.$get({ query: params });
      return parseApiResponse<ApiPaginatedResponse<DepartmentListDTO>>(res);
    },
  });
}

export function useActiveDepartments() {
  return useQuery({
    queryKey: ["departments", "active"],
    queryFn: async () => {
      const res = await apiClient.api.departments.active.$get();
      return parseApiResponse<ApiResponse<DepartmentOption[]>>(res);
    },
  });
}

export function useDepartment(id: string) {
  return useQuery({
    queryKey: ["departments", id],
    queryFn: async () => {
      const res = await apiClient.api.departments[":id"].$get({ param: { id } });
      return parseApiResponse<ApiResponse<DepartmentDetailDTO>>(res);
    },
    enabled: Boolean(id),
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateDepartmentInput) => {
      const res = await apiClient.api.departments.$post({ json: input });
      return parseApiResponse<ApiResponse<DepartmentDetailDTO>>(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      queryClient.invalidateQueries({ queryKey: ["departments", "active"] });
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
    },
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateDepartmentInput }) => {
      const res = await apiClient.api.departments[":id"].$patch({
        param: { id },
        json: input,
      });
      return parseApiResponse<ApiResponse<DepartmentDetailDTO>>(res);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      queryClient.invalidateQueries({ queryKey: ["departments", "active"] });
      queryClient.invalidateQueries({ queryKey: ["departments", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
    },
  });
}

export function useUpdateDepartmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "active" | "inactive" }) => {
      const res = await apiClient.api.departments[":id"].status.$patch({
        param: { id },
        json: { status },
      });
      return parseApiResponse<ApiResponse<DepartmentDetailDTO>>(res);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      queryClient.invalidateQueries({ queryKey: ["departments", "active"] });
      queryClient.invalidateQueries({ queryKey: ["departments", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
    },
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.api.departments[":id"].$delete({
        param: { id },
      });
      return parseApiResponse<ApiResponse<null>>(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      queryClient.invalidateQueries({ queryKey: ["departments", "active"] });
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
    },
  });
}