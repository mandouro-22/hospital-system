import { useQuery } from "@tanstack/react-query";
import { apiClient, parseApiResponse } from "@/lib/api-client";
import type { ApiResponse } from "@/features/auth/types/auth.types";
import type { DepartmentOption } from "../types/department.types";

export function useDepartments() {
  return useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const res = await apiClient.api.departments.$get();
      return parseApiResponse<ApiResponse<DepartmentOption[]>>(res);
    },
  });
}
