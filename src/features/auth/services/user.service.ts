import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { UserRepository } from "../repositories/user.repository";
import { AppError } from "@/lib/errors";
import type { CreateUserInput } from "../validations/create-user.schema";
import type { UpdateUserInput } from "../validations/update-user.schema";
import type { PaginationInput } from "../validations/pagination.schema";
import type { UserProfile, PaginatedResult, Role } from "../types/auth.types";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import {
user as   users,
  staff,
  doctor,
  receptionist,
  department,
} from "@/db/schema";

export type CreatedUserResult = {
  user: UserProfile;
  doctorNumber?: string;
  receptionistNumber?: string;
};

export const UserService = {
  async findById(id: string): Promise<UserProfile> {
    const user = await UserRepository.findById(id);
    if (!user) {
      throw AppError.notFound("User not found");
    }
    return user;
  },

  async findAll(
    params: PaginationInput,
  ): Promise<PaginatedResult<UserProfile>> {
    return UserRepository.findAll({
      page: params.page,
      limit: params.limit,
      search: params.search,
      role: params.role as Role | undefined,
      status: params.status,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
    });
  },

  async createWithProfile(
    input: CreateUserInput,
    createdBy: string,
  ): Promise<CreatedUserResult> {
    const existingUser = await UserRepository.findByEmail(input.email);
    if (existingUser) {
      throw AppError.emailAlreadyExists();
    }

    if (input.role === "Receptionist" || input.role === "Doctor") {
      const existingDepartment = await db
        .select({ id: department.id })
        .from(department)
        .where(eq(department.id, input.departmentId))
        .limit(1);

      if (!existingDepartment.length) {
        throw AppError.departmentNotFound();
      }

      const existingEmployeeCode = await db
        .select({ id: staff.id })
        .from(staff)
        .where(eq(staff.employeeCode, input.employeeCode))
        .limit(1);

      if (existingEmployeeCode.length) {
        throw AppError.employeeCodeAlreadyExists();
      }
    }

    if (input.role === "Doctor") {
      const existingLicense = await db
        .select({ id: doctor.id })
        .from(doctor)
        .where(eq(doctor.licenseNumber, input.licenseNumber))
        .limit(1);

      if (existingLicense.length) {
        throw AppError.licenseNumberAlreadyExists();
      }
    }

    let userId: string | null = null;
    let doctorNumber: string | undefined;
    let receptionistNumber: string | undefined;

    try {
      const result = await auth.api.signUpEmail({
        body: {
          name: input.name,
          email: input.email,
          password: input.password,
          role: input.role,
        },
        headers: new Headers(),
      });

      userId = result.user.id;

      await db.transaction(async (tx) => {
        await tx
          .update(users)
          .set({
            createdBy,
            status: "pending",
            updatedAt: new Date().toISOString(),
          })
          .where(eq(users.id, userId!));

        if (input.role === "Receptionist" || input.role === "Doctor") {
          await tx.insert(staff).values({
            userId: userId!,
            employeeCode: input.employeeCode,
            departmentId: input.departmentId,
            jobTitle: input.jobTitle,
            hireDate: input.hireDate.toISOString(),
          });
        }

        if (input.role === "Doctor") {
          const [createdDoctor] = await tx
            .insert(doctor)
            .values({
              userId: userId!,
              specialization: input.specialization,
              licenseNumber: input.licenseNumber,
              consultationDuration: input.consultationDuration,
            })
            .returning({ doctorNumber: doctor.doctorNumber });

          if (!createdDoctor) {
            throw AppError.internal("Failed to create doctor profile");
          }

          doctorNumber = createdDoctor.doctorNumber;
        }

        if (input.role === "Receptionist") {
          const [createdReceptionist] = await tx
            .insert(receptionist)
            .values({
              userId: userId!,
            })
            .returning({ receptionistNumber: receptionist.receptionistNumber });

          if (!createdReceptionist) {
            throw AppError.internal("Failed to create receptionist profile");
          }

          receptionistNumber = createdReceptionist.receptionistNumber;
        }
      });

      logger.info("user.created", {
        userId,
        email: input.email,
        role: input.role,
        createdBy,
      });

      const finalUser = await UserRepository.findById(userId);
      if (!finalUser) {
        throw AppError.internal("Failed to retrieve created user");
      }

      return { user: finalUser, doctorNumber, receptionistNumber };
    } catch (error) {
      logger.error("user.creation.failed", {
        email: input.email,
        role: input.role,
        error: error instanceof Error ? error.message : String(error),
      });

      if (userId) {
        try {
          await db.delete(users).where(eq(users.id, userId));
        } catch (cleanupError) {
          logger.error("user.cleanup.failed", {
            userId,
            error:
              cleanupError instanceof Error
                ? cleanupError.message
                : String(cleanupError),
          });
        }
      }

      throw error;
    }
  },

  async update(id: string, input: UpdateUserInput): Promise<UserProfile> {
    const existing = await UserRepository.findByIdIncludeDeleted(id);
    if (!existing) {
      throw AppError.notFound("User not found");
    }

    if (existing.deletedAt) {
      throw AppError.badRequest("Cannot update a deactivated user");
    }

    const updateData: Partial<Pick<UserProfile, "name" | "role" | "image">> =
      {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.role !== undefined) updateData.role = input.role as Role;
    if (input.image !== undefined) updateData.image = input.image;

    const updated = await UserRepository.update(id, updateData);
    if (!updated) {
      throw AppError.internal("Failed to update user");
    }

    return updated;
  },

  async softDelete(id: string): Promise<void> {
    const userRecord = await UserRepository.findById(id);
    if (!userRecord) {
      throw AppError.notFound("User not found");
    }

    await UserRepository.softDelete(id);
  },
};
