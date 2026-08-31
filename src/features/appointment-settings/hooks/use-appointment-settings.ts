import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, parseApiResponse } from "@/lib/api-client";
import type { ApiResponse } from "@/features/auth/types/auth.types";
import type { AppointmentSettingsDTO } from "../types/appointment-settings.types";
import type { UpdateAppointmentSettingsInput } from "../validations/appointment-settings.schema";

export function useAppointmentSettings() {
  return useQuery({
    queryKey: ["appointment-settings"],
    queryFn: async () => {
      const response = await apiClient.api["appointment-settings"].$get();
      return parseApiResponse<ApiResponse<AppointmentSettingsDTO>>(response);
    },
  });
}

export function useUpdateAppointmentSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateAppointmentSettingsInput) => {
      const response = await apiClient.api["appointment-settings"].$patch({ json: input });
      return parseApiResponse<ApiResponse<AppointmentSettingsDTO>>(response);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["appointment-settings"] }),
  });
}
