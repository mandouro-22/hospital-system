import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, parseApiResponse } from "@/lib/api-client";
import type { ApiPaginatedResponse, ApiResponse } from "@/features/auth/types/auth.types";
import type { SpecialtyListInput, CreateSpecialtyInput, UpdateSpecialtyInput } from "../validations/specialty.schema";
import type { SpecialtyListDTO, SpecialtyDetailDTO, SpecialtyOption } from "../types/specialty.types";

export function useSpecialties(params?: SpecialtyListInput) {
  return useQuery({
    queryKey: ["specialties", params],
    queryFn: async () => {
      const res = await apiClient.api.specialties.$get({ query: params ?? {} });
      return parseApiResponse<ApiPaginatedResponse<SpecialtyListDTO>>(res);
    },
  });
}

export function useActiveSpecialties() {
  return useQuery({
    queryKey: ["specialties", "active"],
    queryFn: async () => {
      const res = await apiClient.api.specialties.active.$get();
      return parseApiResponse<ApiResponse<SpecialtyOption[]>>(res);
    },
  });
}

export function useSpecialty(id: string) {
  return useQuery({
    queryKey: ["specialties", id],
    queryFn: async () => {
      const res = await apiClient.api.specialties[":id"].$get({ param: { id } });
      return parseApiResponse<ApiResponse<SpecialtyDetailDTO>>(res);
    },
    enabled: Boolean(id),
  });
}

export function useCreateSpecialty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateSpecialtyInput) => {
      const res = await apiClient.api.specialties.$post({ json: input });
      return parseApiResponse<ApiResponse<SpecialtyDetailDTO>>(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["specialties"] });
      queryClient.invalidateQueries({ queryKey: ["specialties", "active"] });
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
    },
  });
}

export function useUpdateSpecialty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateSpecialtyInput }) => {
      const res = await apiClient.api.specialties[":id"].$patch({
        param: { id },
        json: input,
      });
      return parseApiResponse<ApiResponse<SpecialtyDetailDTO>>(res);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["specialties"] });
      queryClient.invalidateQueries({ queryKey: ["specialties", "active"] });
      queryClient.invalidateQueries({ queryKey: ["specialties", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
    },
  });
}

export function useUpdateSpecialtyStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "active" | "inactive" }) => {
      const res = await apiClient.api.specialties[":id"].status.$patch({
        param: { id },
        json: { status },
      });
      return parseApiResponse<ApiResponse<SpecialtyDetailDTO>>(res);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["specialties"] });
      queryClient.invalidateQueries({ queryKey: ["specialties", "active"] });
      queryClient.invalidateQueries({ queryKey: ["specialties", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
    },
  });
}

export function useDeleteSpecialty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.api.specialties[":id"].$delete({
        param: { id },
      });
      return parseApiResponse<ApiResponse<null>>(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["specialties"] });
      queryClient.invalidateQueries({ queryKey: ["specialties", "active"] });
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
    },
  });
}
