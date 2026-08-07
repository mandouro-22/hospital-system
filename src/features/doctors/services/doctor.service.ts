import { eq } from "drizzle-orm";
import { db } from "@/db";
import { doctor, department } from "@/db/auth-schema";
import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { DoctorRepository } from "../repositories/doctor.repository";
import type { DoctorListInput, UpdateDoctorInput } from "../validations/doctor.schema";
import type { DoctorRecord } from "../repositories/doctor.repository";
import type { DoctorScheduleDTO } from "../types/doctor.types";

export const DoctorService = {
  async findAll(params: DoctorListInput) {
    return DoctorRepository.findAll(params);
  },

  async findById(id: string): Promise<DoctorRecord> {
    const record = await DoctorRepository.findById(id);
    if (!record) {
      throw AppError.notFound("Doctor not found");
    }
    return record;
  },

  async findSchedule(doctorId: string): Promise<DoctorScheduleDTO[]> {
    await this.findById(doctorId);
    return DoctorRepository.findSchedule(doctorId);
  },

  async update(id: string, input: UpdateDoctorInput): Promise<DoctorRecord> {
    const record = await DoctorRepository.findById(id);
    if (!record) {
      throw AppError.notFound("Doctor not found");
    }

    if (
      input.licenseNumber !== undefined &&
      input.licenseNumber !== record.licenseNumber
    ) {
      const existing = await db
        .select({ id: doctor.id })
        .from(doctor)
        .where(eq(doctor.licenseNumber, input.licenseNumber))
        .limit(1);
      if (existing.length) {
        throw AppError.licenseNumberAlreadyExists();
      }
    }

    if (input.departmentId !== undefined) {
      const existingDepartment = await db
        .select({ id: department.id })
        .from(department)
        .where(eq(department.id, input.departmentId))
        .limit(1);
      if (!existingDepartment.length) {
        throw AppError.departmentNotFound();
      }
    }

    if (
      input.specialization !== undefined ||
      input.licenseNumber !== undefined ||
      input.consultationDuration !== undefined
    ) {
      await DoctorRepository.update(id, {
        specialization: input.specialization,
        licenseNumber: input.licenseNumber,
        consultationDuration: input.consultationDuration,
      });
    }
    if (input.departmentId !== undefined) {
      await DoctorRepository.updateDepartment(record.userId, input.departmentId);
    }
    if (input.name !== undefined) {
      await DoctorRepository.updateUserName(record.userId, input.name);
    }

    logger.info("doctor.updated", { id, userId: record.userId });
    const updated = await DoctorRepository.findById(id);
    if (!updated) {
      throw AppError.internal("Failed to update doctor");
    }
    return updated;
  },
};