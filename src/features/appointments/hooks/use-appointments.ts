import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, parseApiResponse } from "@/lib/api-client";
import type { ApiPaginatedResponse, ApiResponse } from "@/features/auth/types/auth.types";
import type { AppointmentListDTO, DisabledAppointmentDateDTO } from "../types/appointment.types";
import type { AppointmentListInput, DisableAppointmentDateInput } from "../validations/appointment.schema";

export function useAppointments(params: AppointmentListInput) {
  return useQuery({
    queryKey: ["appointments", params],
    queryFn: async () => {
      const response = await apiClient.api.appointments.$get({ query: params });
      return parseApiResponse<ApiPaginatedResponse<AppointmentListDTO>>(response);
    },
  });
}

export function useDisabledAppointmentDates() {
  return useQuery({
    queryKey: ["appointments", "disabled-dates"],
    queryFn: async () => {
      const response = await apiClient.api.appointments["disabled-dates"].$get();
      return parseApiResponse<ApiResponse<DisabledAppointmentDateDTO[]>>(response);
    },
  });
}

export function useDisableAppointmentDate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: DisableAppointmentDateInput) => {
      const response = await apiClient.api.appointments["disabled-dates"].$post({ json: input });
      return parseApiResponse<ApiResponse<DisabledAppointmentDateDTO>>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments", "disabled-dates"] });
    },
  });
}

export function useEnableAppointmentDate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.api.appointments["disabled-dates"][":id"].$delete({
        param: { id },
      });
      return parseApiResponse<ApiResponse<null>>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments", "disabled-dates"] });
    },
  });
}
