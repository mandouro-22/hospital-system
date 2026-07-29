import type { Context, Next } from "hono";
import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { AppError } from "@/lib/errors";
import { UserRepository } from "../repositories/user.repository";
import type { Role } from "../types/auth.types";

export type AuthVariables = {
  userId: string;
  userName: string;
  userEmail: string;
  userRole: Role;
  sessionToken: string;
};

export async function requireAuth(c: Context, next: Next): Promise<Response | void> {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    throw AppError.unauthorized("Authentication required");
  }

  const userRecord = await UserRepository.findByIdIncludeDeleted(session.user.id);
  if (userRecord?.deletedAt) {
    throw AppError.forbidden("Account has been deactivated");
  }

  c.set("userId", session.user.id);
  c.set("userName", session.user.name);
  c.set("userEmail", session.user.email);
  c.set("userRole", session.user.role as Role);
  c.set("sessionToken", session.session.token);

  return next();
}

export function requireRole(...roles: Role[]) {
  return async (c: Context, next: Next): Promise<Response | void> => {
    const userRole = c.get("userRole") as Role;
    const userId = c.get("userId") as string;

    if (!roles.includes(userRole)) {
      logger.warn("permission.denied", { userId, userRole, requiredRoles: roles, path: c.req.path });
      throw AppError.forbidden("You do not have permission to perform this action");
    }

    return next();
  };
}

export const requireAdmin = requireRole("Admin");