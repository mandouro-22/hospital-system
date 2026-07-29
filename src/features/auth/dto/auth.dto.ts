import type { Role, AuthenticatedUser, AuthSession } from "../types/auth.types";

export function toAuthSessionDTO(
  session: NonNullable<AuthSession>,
  lastLogin: Date | null,
): AuthenticatedUser {
  return {
    id: session.user.id,
    fullName: session.user.name,
    email: session.user.email,
    role: session.user.role,
    image: session.user.image,
    status: "active",
    lastLogin,
  };
}

export function toSessionDTO(session: NonNullable<AuthSession>) {
  return {
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      emailVerified: session.user.emailVerified,
      image: session.user.image,
      role: session.user.role as Role,
      createdAt: session.user.createdAt,
      updatedAt: session.user.updatedAt,
    },
    session: {
      id: session.session.id,
      expiresAt: session.session.expiresAt,
      token: session.session.token,
      createdAt: session.session.createdAt,
      updatedAt: session.session.updatedAt,
      ipAddress: session.session.ipAddress,
      userAgent: session.session.userAgent,
      userId: session.session.userId,
    },
  };
}