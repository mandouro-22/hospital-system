import { Hono } from "hono";
import { requireAuth, requireAdmin } from "@/features/auth/middleware/auth.middleware";
import { uuidParamSchema } from "@/features/auth/validations/params.schema";
import { paginationSchema } from "@/features/auth/validations/pagination.schema";
import { createUserSchema } from "@/features/auth/validations/create-user.schema";
import { updateUserSchema } from "@/features/auth/validations/update-user.schema";
import { UserService } from "@/features/auth/services/user.service";
import { success, created, paginated } from "@/lib/response";
import { AppError } from "@/lib/errors";
import type { ApiError } from "@/features/auth/types/auth.types";
import type { AuthVariables } from "@/features/auth/middleware/auth.middleware";
import { toSanitizedUserDTO } from "@/features/auth/dto/user.dto";

const userRoutes = new Hono<{ Variables: AuthVariables }>();

userRoutes.get("/:id", requireAuth, async (c) => {
  const paramResult = uuidParamSchema.safeParse({ id: c.req.param("id") });
  if (!paramResult.success) {
    throw AppError.validation("Invalid user ID", paramResult.error.flatten().fieldErrors);
  }

  const user = await UserService.findById(paramResult.data.id);
  return success(c, toSanitizedUserDTO(user));
});

userRoutes.get("/", requireAuth, async (c) => {
  const query = Object.fromEntries(new URL(c.req.url).searchParams.entries());
  const parsed = paginationSchema.safeParse(query);

  if (!parsed.success) {
    return c.json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid query parameters",
        details: parsed.error.flatten().fieldErrors,
      },
    } as ApiError, 422);
  }

  const result = await UserService.findAll(parsed.data);
  return paginated(c, result.data.map(toSanitizedUserDTO), result.pagination);
});

userRoutes.post("/", requireAuth, requireAdmin, async (c) => {
  const body = await c.req.json();
  const parsed = createUserSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        details: parsed.error.flatten().fieldErrors,
      },
    } as ApiError, 422);
  }

  const user = await UserService.create(parsed.data);
  return created(c, toSanitizedUserDTO(user), "User created successfully");
});

userRoutes.patch("/:id", requireAuth, requireAdmin, async (c) => {
  const paramResult = uuidParamSchema.safeParse({ id: c.req.param("id") });
  if (!paramResult.success) {
    throw AppError.validation("Invalid user ID", paramResult.error.flatten().fieldErrors);
  }

  const body = await c.req.json();
  const parsed = updateUserSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        details: parsed.error.flatten().fieldErrors,
      },
    } as ApiError, 422);
  }

  const user = await UserService.update(paramResult.data.id, parsed.data);
  return success(c, toSanitizedUserDTO(user), "User updated successfully");
});

userRoutes.delete("/:id", requireAuth, requireAdmin, async (c) => {
  const paramResult = uuidParamSchema.safeParse({ id: c.req.param("id") });
  if (!paramResult.success) {
    throw AppError.validation("Invalid user ID", paramResult.error.flatten().fieldErrors);
  }

  await UserService.softDelete(paramResult.data.id);
  return success(c, null, "User deleted successfully");
});

export { userRoutes };