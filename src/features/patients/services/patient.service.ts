import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { db } from "@/db";
import { UserRepository } from "@/features/auth/repositories/user.repository";
import { PatientRepository } from "../repositories/patient.repository";
import type {
  CreatePatientInput,
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

  async create(
    input: CreatePatientInput,
    createdBy: string,
  ): Promise<PatientRecord> {
    const existingUser = await UserRepository.findByEmail(input.email);
    if (existingUser) {
      throw AppError.emailAlreadyExists();
    }

    if (await PatientRepository.existsByPHN(input.phn)) {
      throw AppError.phnAlreadyExists();
    }

    const name = `${input.firstName} ${input.lastName}`.trim();

    try {
      const created = await db.transaction(async (tx) => {
        const user = await PatientRepository.createUser(
          {
            name,
            email: input.email,
            password: input.password,
            role: "Patient",
            status: "active",
            createdBy,
          },
          tx,
        );

        return PatientRepository.createPatient(
          {
            userId: user.id,
            phn: input.phn,
            phone: input.phone,
            gender: input.gender ?? null,
            dateOfBirth: input.dateOfBirth
              ? new Date(input.dateOfBirth).toISOString()
              : null,
            address: input.address,
          },
          tx,
        );
      });

      logger.info("patient.created", {
        id: created.id,
        patientNumber: created.patientNumber,
        phn: input.phn,
        createdBy,
      });

      const record = await PatientRepository.findById(created.id);
      if (!record) {
        throw AppError.internal("Failed to retrieve created patient");
      }
      return record;
    } catch (error) {
      logger.error("patient.creation.failed", {
        email: input.email,
        phn: input.phn,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
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