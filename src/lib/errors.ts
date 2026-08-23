export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "AppError";
  }

  static badRequest(message: string, details?: Record<string, string[]>) {
    return new AppError(400, "BAD_REQUEST", message, details);
  }

  static unauthorized(message = "Unauthorized") {
    return new AppError(401, "UNAUTHORIZED", message);
  }

  static forbidden(message = "Forbidden") {
    return new AppError(403, "FORBIDDEN", message);
  }

  static notFound(message = "Resource not found") {
    return new AppError(404, "NOT_FOUND", message);
  }

  static conflict(message: string) {
    return new AppError(409, "CONFLICT", message);
  }

  static validation(message: string, details?: Record<string, string[]>) {
    return new AppError(422, "VALIDATION_ERROR", message, details);
  }

  static internal(message = "Internal server error") {
    return new AppError(500, "INTERNAL_ERROR", message);
  }

  static emailAlreadyExists(message = "Email already exists") {
    return new AppError(409, "EMAIL_ALREADY_EXISTS", message);
  }

  static employeeCodeAlreadyExists(message = "Employee code already exists") {
    return new AppError(409, "EMPLOYEE_CODE_ALREADY_EXISTS", message);
  }

  static licenseNumberAlreadyExists(message = "License number already exists") {
    return new AppError(409, "LICENSE_NUMBER_ALREADY_EXISTS", message);
  }

  static phnAlreadyExists(message = "PHN already exists") {
    return new AppError(409, "PHN_ALREADY_EXISTS", message);
  }

  static departmentNotFound(message = "Department not found") {
    return new AppError(404, "DEPARTMENT_NOT_FOUND", message);
  }

  static departmentNameAlreadyExists(message = "Department name already exists") {
    return new AppError(409, "DEPARTMENT_NAME_ALREADY_EXISTS", message);
  }

  static departmentHasActiveDoctors(message = "Cannot deactivate or delete department with active doctors") {
    return new AppError(409, "DEPARTMENT_HAS_ACTIVE_DOCTORS", message);
  }

  static specialtyNotFound(message = "Specialty not found") {
    return new AppError(404, "SPECIALTY_NOT_FOUND", message);
  }

  static specialtyNameAlreadyExists(message = "Specialty name already exists") {
    return new AppError(409, "SPECIALTY_NAME_ALREADY_EXISTS", message);
  }

  static specialtyHasActiveDoctors(message = "Cannot deactivate or delete specialty with active doctors") {
    return new AppError(409, "SPECIALTY_HAS_ACTIVE_DOCTORS", message);
  }

  static invalidRole(message = "Invalid role") {
    return new AppError(400, "INVALID_ROLE", message);
  }
}
