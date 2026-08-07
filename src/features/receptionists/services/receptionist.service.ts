import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, staff, department, receptionist } from "@/db/auth-schema";
import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { ReceptionistRepository } from "../repositories/receptionist.repository";
import type {
  ReceptionistListInput,
  UpdateReceptionistInput,
} from "../validations/receptionist.schema";
import type { ReceptionistRecord } from "../repositories/receptionist.repository";

export const ReceptionistService = {
  async findAll(params: ReceptionistListInput) {
    return ReceptionistRepository.findAll(params);
  },

  async findById(id: string): Promise<ReceptionistRecord> {
    const record = await ReceptionistRepository.findById(id);
    if (!record) {
      throw AppError.notFound("Receptionist not found");
    }
    return record;
  },

  async findByUserId(userId: string): Promise<ReceptionistRecord | null> {
    return ReceptionistRepository.findByUserId(userId);
  },

  async update(
    id: string,
    input: UpdateReceptionistInput,
  ): Promise<ReceptionistRecord> {
    const record = await ReceptionistRepository.findById(id);
    if (!record) {
      throw AppError.notFound("Receptionist not found");
    }

    if (input.name !== undefined) {
      await ReceptionistRepository.update(record.userId, {
        name: input.name,
      });
    }

    logger.info("receptionist.updated", { id, userId: record.userId });
    const updated = await ReceptionistRepository.findById(id);
    if (!updated) {
      throw AppError.internal("Failed to update receptionist");
    }
    return updated;
  },
};
