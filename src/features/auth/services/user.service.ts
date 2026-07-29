import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { UserRepository } from "../repositories/user.repository";
import { AppError } from "@/lib/errors";
import type { CreateUserInput } from "../validations/create-user.schema";
import type { UpdateUserInput } from "../validations/update-user.schema";
import type { PaginationInput } from "../validations/pagination.schema";
import type { UserProfile, PaginatedResult, Role } from "../types/auth.types";

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

  async create(input: CreateUserInput): Promise<UserProfile> {
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