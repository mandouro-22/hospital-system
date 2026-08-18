import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, parseApiResponse } from "@/lib/api-client";
import type {
  ApiPaginatedResponse,
  ApiResponse,
} from "@/features/auth/types/auth.types";
import type {
  PatientListInput,
  PatientStatusInput,
  CreatePatientInput,
} from "../validations/patient.schema";
import type {
  PatientDetailDTO,
  PatientListDTO,
} from "../types/patient.types";

export function usePatients(params: PatientListInput) {
  return useQuery({
    queryKey: ["patients", params],
    queryFn: async () => {
      const res = await apiClient.api.patients.$get({ query: params });
      return parseApiResponse<ApiPaginatedResponse<PatientListDTO>>(res);
    },
  });
}

export function usePatient(id: string) {
  return useQuery({
    queryKey: ["patients", id],
    queryFn: async () => {
      const res = await apiClient.api.patients[":id"].$get({
        param: { id },
      });
      return parseApiResponse<ApiResponse<PatientDetailDTO>>(res);
    },
    enabled: Boolean(id),
  });
}

export function useCreatePatientMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreatePatientInput) => {
      const res = await apiClient.api.patients.$post({ json: input });
      return parseApiResponse<ApiResponse<PatientDetailDTO>>(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useUpdatePatientStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: PatientStatusInput;
    }) => {
      const res = await apiClient.api.patients[":id"].status.$patch({
        param: { id },
        json: input,
      });
      return parseApiResponse<ApiResponse<PatientDetailDTO>>(res);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({
        queryKey: ["patients", variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}