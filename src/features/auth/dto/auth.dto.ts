import type { Role, AuthSession, AuthSessionDTO, AuthenticatedUserDTO } from "../types/auth.types";

export function toAuthSessionDTO(
  session: NonNullable<AuthSession>,
  lastLogin: Date | null,
): AuthenticatedUserDTO {
  return {
    id: session.user.id,
    fullName: session.user.name,
    email: session.user.email,
    role: session.user.role,
    image: session.user.image,
    status: session.user.status ?? "active",
    lastLogin: lastLogin ? lastLogin.toISOString() : null,
  };
}

export function toSessionDTO(session: NonNullable<AuthSession>): AuthSessionDTO {
  return {
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      emailVerified: session.user.emailVerified,
      image: session.user.image,
      role: session.user.role as Role,
      createdAt: session.user.createdAt.toISOString(),
      updatedAt: session.user.updatedAt.toISOString(),
    },
    session: {
      id: session.session.id,
      expiresAt: session.session.expiresAt.toISOString(),
      token: session.session.token,
      createdAt: session.session.createdAt.toISOString(),
      updatedAt: session.session.updatedAt.toISOString(),
      ipAddress: session.session.ipAddress,
      userAgent: session.session.userAgent,
      userId: session.session.userId,
    },
  };
}