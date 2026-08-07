import { DepartmentRepository } from "../repositories/department.repository";
import type { DepartmentOption } from "../types/department.types";

export const DepartmentService = {
  async findAll(): Promise<DepartmentOption[]> {
    return DepartmentRepository.findAll();
  },
};
