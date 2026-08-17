import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { PatientRepository } from "../repositories/patient.repository";
import type {
  PatientListInput,
  PatientStatusInput,
} from "../validations/patient.schema";
import type { PatientRecord } from "../repositories/patient.repository";

export const PatientService = {
  async findAll(params: PatientListInput) {
    return PatientRepository.findAll(params);
  },

  async findById(id: string): Promise<PatientRecord> {
    const record = await PatientRepository.findById(id);
    if (!record) {
      throw AppError.notFound("Patient not found");
    }
    return record;
  },

  async updateStatus(
    id: string,
    input: PatientStatusInput,
    actorUserId: string,
  ): Promise<PatientRecord> {
    const record = await PatientRepository.findById(id);
    if (!record) {
      throw AppError.notFound("Patient not found");
    }

    if (record.status === input.status) {
      throw AppError.badRequest(`Patient is already ${input.status}`);
    }

    await PatientRepository.updateStatus(record.userId, input.status);

    logger.info("patient.status.updated", {
      id,
      userId: record.userId,
      status: input.status,
      updatedBy: actorUserId,
    });

    const updated = await PatientRepository.findById(id);
    if (!updated) {
      throw AppError.internal("Failed to update patient");
    }
    return updated;
  },
};