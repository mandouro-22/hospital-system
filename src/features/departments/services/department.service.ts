import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { DepartmentRepository } from "../repositories/department.repository";
import type {
  DepartmentListInput,
  CreateDepartmentInput,
  UpdateDepartmentInput,
} from "../validations/department.schema";
import type { DepartmentRecord } from "../repositories/department.repository";

export const DepartmentService = {
  async findAll(params: DepartmentListInput) {
    return DepartmentRepository.findAll(params);
  },

  async findById(id: string): Promise<DepartmentRecord> {
    const record = await DepartmentRepository.findById(id);
    if (!record) {
      throw AppError.notFound("Department not found");
    }
    return record;
  },

  async findAllActive() {
    return DepartmentRepository.findAllActive();
  },

  async create(input: CreateDepartmentInput): Promise<DepartmentRecord> {
    const existing = await DepartmentRepository.existsByName(input.name);
    if (existing) {
      throw AppError.departmentNameAlreadyExists();
    }

    const id = input.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .substring(0, 45);

    const finalId = `${id}-${Date.now().toString(36).substring(0, 5)}`;

    const record = await DepartmentRepository.create({
      id: finalId,
      name: input.name,
      description: input.description ?? null,
      status: input.status,
    });

    logger.info("department.created", { id: finalId, name: input.name });
    return record;
  },

  async update(
    id: string,
    input: UpdateDepartmentInput,
  ): Promise<DepartmentRecord> {
    const record = await DepartmentRepository.findById(id);
    if (!record) {
      throw AppError.notFound("Department not found");
    }

    if (input.name !== undefined && input.name !== record.name) {
      const existing = await DepartmentRepository.existsByName(input.name, id);
      if (existing) {
        throw AppError.departmentNameAlreadyExists();
      }
    }

    const updated = await DepartmentRepository.update(id, input);
    if (!updated) {
      throw AppError.internal("Failed to update department");
    }

    logger.info("department.updated", { id });
    return updated;
  },

  async updateStatus(
    id: string,
    status: "active" | "inactive",
  ): Promise<DepartmentRecord> {
    const record = await DepartmentRepository.findById(id);
    if (!record) {
      throw AppError.notFound("Department not found");
    }

    if (status === "inactive") {
      const hasActiveDoctors = await DepartmentRepository.hasActiveDoctors(id);
      if (hasActiveDoctors) {
        throw AppError.departmentHasActiveDoctors();
      }
    }

    const updated = await DepartmentRepository.updateStatus(id, status);
    if (!updated) {
      throw AppError.internal("Failed to update department status");
    }

    logger.info(
      status === "active" ? "department.activated" : "department.deactivated",
      { id },
    );
    return updated;
  },

  async delete(id: string): Promise<void> {
    const record = await DepartmentRepository.findById(id);
    if (!record) {
      throw AppError.notFound("Department not found");
    }

    const hasActiveDoctors = await DepartmentRepository.hasActiveDoctors(id);
    if (hasActiveDoctors) {
      throw AppError.departmentHasActiveDoctors();
    }

    await DepartmentRepository.delete(id);
    logger.info("department.deleted", { id });
  },
};
