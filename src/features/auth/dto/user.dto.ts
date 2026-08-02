import type { UserProfile, Role, SanitizedUserDTO } from "../types/auth.types";

export function toUserProfileDTO(user: UserProfile) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
    image: user.image,
    role: user.role as Role,
    status: user.status,
    lastLogin: user.lastLogin?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export function toSanitizedUserDTO(user: UserProfile): SanitizedUserDTO {
  return {
    id: user.id,
    fullName: user.name,
    email: user.email,
    role: user.role as Role,
    image: user.image,
    status: user.status,
    lastLogin: new Date(user.lastLogin as Date),
    emailVerified: user.emailVerified,
    createdAt: user.createdAt.toISOString(),
  };
}
