import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { SpecialtyRepository } from "../repositories/specialty.repository";
import type {
  SpecialtyListInput,
  CreateSpecialtyInput,
  UpdateSpecialtyInput,
} from "../validations/specialty.schema";
import type { SpecialtyRecord } from "../repositories/specialty.repository";

export const SpecialtyService = {
  async findAll(params: SpecialtyListInput) {
    return SpecialtyRepository.findAll(params);
  },

  async findById(id: string): Promise<SpecialtyRecord> {
    const record = await SpecialtyRepository.findById(id);
    if (!record) {
      throw AppError.specialtyNotFound();
    }
    return record;
  },

  async findAllActive() {
    return SpecialtyRepository.findAllActive();
  },

  async create(input: CreateSpecialtyInput): Promise<SpecialtyRecord> {
    const existing = await SpecialtyRepository.existsByName(input.name);
    if (existing) {
      throw AppError.specialtyNameAlreadyExists();
    }

    const id = input.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .substring(0, 45);

    const finalId = `${id}-${Date.now().toString(36).substring(0, 5)}`;

    const record = await SpecialtyRepository.create({
      id: finalId,
      name: input.name,
      description: input.description ?? null,
      status: input.status,
    });

    logger.info("specialty.created", { id: finalId, name: input.name });
    return record;
  },

  async update(
    id: string,
    input: UpdateSpecialtyInput,
  ): Promise<SpecialtyRecord> {
    const record = await SpecialtyRepository.findById(id);
    if (!record) {
      throw AppError.specialtyNotFound();
    }

    if (input.name !== undefined && input.name !== record.name) {
      const existing = await SpecialtyRepository.existsByName(input.name, id);
      if (existing) {
        throw AppError.specialtyNameAlreadyExists();
      }
    }

    const updated = await SpecialtyRepository.update(id, input);
    if (!updated) {
      throw AppError.internal("Failed to update specialty");
    }

    logger.info("specialty.updated", { id });
    return updated;
  },

  async updateStatus(
    id: string,
    status: "active" | "inactive",
  ): Promise<SpecialtyRecord> {
    const record = await SpecialtyRepository.findById(id);
    if (!record) {
      throw AppError.specialtyNotFound();
    }

    if (status === "inactive") {
      const hasActiveDoctors = await SpecialtyRepository.hasActiveDoctors(id);
      if (hasActiveDoctors) {
        throw AppError.specialtyHasActiveDoctors();
      }
    }

    const updated = await SpecialtyRepository.updateStatus(id, status);
    if (!updated) {
      throw AppError.internal("Failed to update specialty status");
    }

    logger.info(
      status === "active" ? "specialty.activated" : "specialty.deactivated",
      { id },
    );
    return updated;
  },

  async delete(id: string): Promise<void> {
    const record = await SpecialtyRepository.findById(id);
    if (!record) {
      throw AppError.specialtyNotFound();
    }

    const hasActiveDoctors = await SpecialtyRepository.hasActiveDoctors(id);
    if (hasActiveDoctors) {
      throw AppError.specialtyHasActiveDoctors();
    }

    await SpecialtyRepository.delete(id);
    logger.info("specialty.deleted", { id });
  },
};
