import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { UserRepository } from "../repositories/user.repository";
import { AccountRepository } from "../repositories/account.repository";
import { AppError } from "@/lib/errors";
import type { CreateUserInput } from "../validations/create-user.schema";
import type { UpdateUserInput } from "../validations/update-user.schema";
import type { PaginationInput } from "../validations/pagination.schema";
import type { UserProfile, PaginatedResult, Role } from "../types/auth.types";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import {
  users,
  staff,
  doctor,
  department,
} from "@/db/auth-schema";

export const UserService = {
  async findById(id: string): Promise<UserProfile> {
    const user = await UserRepository.findById(id);
    if (!user) {
      throw AppError.notFound("User not found");
    }
    return user;
  },

  async findAll(params: PaginationInput): Promise<PaginatedResult<UserProfile>> {
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

  async create(input: CreateUserInput, createdBy?: string): Promise<UserProfile> {
    const existing = await UserRepository.findByEmail(input.email);
    if (existing) {
      throw AppError.conflict("A user with this email already exists");
    }

    const result = await auth.api.signUpEmail({
      body: {
        name: input.name,
        email: input.email,
        password: input.password,
        role: input.role,
      },
      headers: new Headers(),
    });

    const created = await UserRepository.findById(result.user.id);
    if (!created) {
      throw AppError.internal("Failed to create user");
    }

    logger.info("user.created", { userId: created.id, email: created.email, role: created.role });

    return created;
  },

  async createWithProfile(
    input: CreateUserInput,
    createdBy: string,
  ): Promise<UserProfile> {
    const existingUser = await UserRepository.findByEmail(input.email);
    if (existingUser) {
      throw AppError.conflict("A user with this email already exists");
    }

    const existingDept = await db
      .select()
      .from(department)
      .where(eq(department.id, input.departmentId))
      .limit(1);

    if (!existingDept || existingDept.length === 0) {
      throw AppError.badRequest("Department not found");
    }

    let userId: string;
    let staffRecordId?: string;
    let doctorRecordId?: string;

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

      const userProfile = await UserRepository.findById(userId);
      if (!userProfile) {
        throw AppError.internal("Failed to create user");
      }

      const userUpdateData = {
        createdBy,
        status: "PENDING" as const,
        updatedAt: new Date(),
      };

      await db.update(users).set(userUpdateData).where(eq(users.id, userId));

      if (input.role === "RECEPTIONIST") {
        const [staffRecord] = await db
          .insert(staff)
          .values({
            userId,
            employeeCode: input.employeeCode,
            departmentId: input.departmentId,
            jobTitle: input.jobTitle,
            hireDate: input.hireDate || new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();

        staffRecordId = staffRecord.id;

        const employeeCodeExists = await db
          .select()
          .from(staff)
          .where(eq(staff.employeeCode, input.employeeCode))
          .limit(1);

        if (employeeCodeExists.length > 0) {
          throw AppError.conflict("Employee code already exists");
        }
      } else if (input.role === "DOCTOR") {
        const [doctorRecord] = await db
          .insert(doctor)
          .values({
            userId,
            specialization: input.specialization,
            licenseNumber: input.licenseNumber,
            consultationDuration: input.consultationDuration,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();

        doctorRecordId = doctorRecord.id;

        const licenseNumberExists = await db
          .select()
          .from(doctor)
          .where(eq(doctor.licenseNumber, input.licenseNumber))
          .limit(1);

        if (licenseNumberExists.length > 0) {
          throw AppError.conflict("License number already exists");
        }

        const employeeCodeExists = await db
          .select()
          .from(staff)
          .where(eq(staff.employeeCode, input.employeeCode))
          .limit(1);

        if (employeeCodeExists.length > 0) {
          throw AppError.conflict("Employee code already exists");
        }

        const staffRecord = await db
          .insert(staff)
          .values({
            userId,
            employeeCode: input.employeeCode,
            departmentId: input.departmentId,
            jobTitle: input.jobTitle,
            hireDate: input.hireDate || new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();

        staffRecordId = staffRecord[0].id;
      }

      logger.info("user.created", {
        userId,
        email: input.email,
        role: input.role,
        createdBy,
        staffRecordId,
        doctorRecordId,
      });

      const finalUser = await UserRepository.findById(userId);
      if (!finalUser) {
        throw AppError.internal("Failed to retrieve created user");
      }

      return finalUser;
    } catch (error) {
      logger.error("user.creation.failed", {
        email: input.email,
        role: input.role,
        error: error instanceof Error ? error.message : String(error),
      });

      if (userId) {
        try {
          await AccountRepository.deleteByUserId(userId);
        } catch (cleanupError) {
          logger.error("user.cleanup.failed", {
            userId,
            error: cleanupError instanceof Error ? cleanupError.message : String(cleanupError),
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

    const updateData: Partial<Pick<UserProfile, "name" | "role" | "image">> = {};
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
