import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, parseApiResponse } from "@/lib/api-client";
import type {
  ApiPaginatedResponse,
  ApiResponse,
} from "@/features/auth/types/auth.types";
import type {
  ReceptionistListInput,
  UpdateReceptionistInput,
} from "../validations/receptionist.schema";
import type {
  ReceptionistDetailDTO,
  ReceptionistListDTO,
} from "../types/receptionist.types";

export function useReceptionists(params: ReceptionistListInput) {
  return useQuery({
    queryKey: ["receptionists", params],
    queryFn: async () => {
      const res = await apiClient.api.receptionists.$get({ query: params });
      return parseApiResponse<ApiPaginatedResponse<ReceptionistListDTO>>(res);
    },
  });
}

export function useReceptionist(id: string) {
  return useQuery({
    queryKey: ["receptionists", id],
    queryFn: async () => {
      const res = await apiClient.api.receptionists[":id"].$get({
        param: { id },
      });
      return parseApiResponse<ApiResponse<ReceptionistDetailDTO>>(res);
    },
    enabled: Boolean(id),
  });
}

export function useUpdateReceptionist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: UpdateReceptionistInput;
    }) => {
      const res = await apiClient.api.receptionists[":id"].$patch({
        param: { id },
        json: input,
      });
      return parseApiResponse<ApiResponse<ReceptionistDetailDTO>>(res);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["receptionists"] });
      queryClient.invalidateQueries({
        queryKey: ["receptionists", variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
