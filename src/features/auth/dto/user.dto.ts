import type { UserProfile, Role } from "../types/auth.types";

export function toUserProfileDTO(user: UserProfile) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
    image: user.image,
    role: user.role as Role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function toSanitizedUserDTO(user: UserProfile) {
  return {
    id: user.id,
    fullName: user.name,
    email: user.email,
    role: user.role as Role,
    image: user.image,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
  };
}