import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, parseApiResponse } from "@/lib/api-client";
import type { ApiPaginatedResponse, ApiResponse } from "@/features/auth/types/auth.types";
import type { DoctorListInput, UpdateDoctorInput } from "../validations/doctor.schema";
import type { DoctorDetailDTO, DoctorListDTO, DoctorScheduleDTO } from "../types/doctor.types";

export function useDoctors(params: DoctorListInput) {
  return useQuery({
    queryKey: ["doctors", params],
    queryFn: async () => {
      const res = await apiClient.api.doctors.$get({ query: params });
      return parseApiResponse<ApiPaginatedResponse<DoctorListDTO>>(res);
    },
  });
}

export function useDoctor(id: string) {
  return useQuery({
    queryKey: ["doctors", id],
    queryFn: async () => {
      const res = await apiClient.api.doctors[":id"].$get({ param: { id } });
      return parseApiResponse<ApiResponse<DoctorDetailDTO>>(res);
    },
    enabled: Boolean(id),
  });
}

export function useUpdateDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateDoctorInput }) => {
      const res = await apiClient.api.doctors[":id"].$patch({
        param: { id },
        json: input,
      });
      return parseApiResponse<ApiResponse<DoctorDetailDTO>>(res);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["doctors", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useDoctorSchedule(doctorId: string) {
  return useQuery({
    queryKey: ["doctors", doctorId, "schedule"],
    queryFn: async () => {
      const res = await apiClient.api.doctors[":id"].schedule.$get({
        param: { id: doctorId },
      });
      return parseApiResponse<ApiResponse<DoctorScheduleDTO[]>>(res);
    },
    enabled: Boolean(doctorId),
  });
}