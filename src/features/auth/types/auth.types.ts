export type Role = "Admin" | "Doctor" | "Receptionist" | "Patient";

export const ROLES: Role[] = ["Admin", "Doctor", "Receptionist", "Patient"];

export type UserStatus = "active" | "inactive" | "locked" | "suspended";

export interface AuthSession {
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image: string | null;
    role: Role;
    createdAt: Date;
    updatedAt: Date;
  };
  session: {
    id: string;
    expiresAt: Date;
    token: string;
    createdAt: Date;
    updatedAt: Date;
    ipAddress: string | null;
    userAgent: string | null;
    userId: string;
  };
}

export interface AuthenticatedUser {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  image: string | null;
  status: UserStatus;
  lastLogin: Date | null;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  role?: Role;
  status?: UserStatus;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

export interface ApiPaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  role: Role;
};

export type UpdateUserInput = {
  name?: string;
  role?: Role;
  image?: string | null;
};