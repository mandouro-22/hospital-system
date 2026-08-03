import { Hono } from "hono";
import { zodValidator } from "@/lib/zod-validator";
import { requireAuth, requireAdmin } from "@/features/auth/middleware/auth.middleware";
import { uuidParamSchema } from "@/features/auth/validations/params.schema";
import { paginationSchema } from "@/features/auth/validations/pagination.schema";
import { createUserSchema } from "@/features/auth/validations/create-user.schema";
import { updateUserSchema } from "@/features/auth/validations/update-user.schema";
import { UserService } from "@/features/auth/services/user.service";
import { success, created, paginated } from "@/lib/response";
import type { AuthVariables } from "@/features/auth/middleware/auth.middleware";
import { toSanitizedUserDTO } from "@/features/auth/dto/user.dto";

export const userRoutes = new Hono<{ Variables: AuthVariables }>()
  .get(
    "/:id",
    requireAuth,
    zodValidator("param", uuidParamSchema),
    async (c) => {
      const user = await UserService.findById(c.req.valid("param").id);
      return success(c, toSanitizedUserDTO(user));
    },
  )
  .get(
    "/",
    requireAuth,
    zodValidator("query", paginationSchema),
    async (c) => {
      const result = await UserService.findAll(c.req.valid("query"));
      return paginated(c, result.data.map(toSanitizedUserDTO), result.pagination);
    },
  )
  .post(
    "/",
    requireAuth,
    requireAdmin,
    zodValidator("json", createUserSchema),
    async (c) => {
      const input = c.req.valid("json");
      const createdBy = c.get("userId");

      const user = await UserService.createWithProfile(input, createdBy);
      return created(c, toSanitizedUserDTO(user), "User created successfully");
    },
  )
  .patch(
    "/:id",
    requireAuth,
    requireAdmin,
    zodValidator("param", uuidParamSchema),
    zodValidator("json", updateUserSchema),
    async (c) => {
      const user = await UserService.update(c.req.valid("param").id, c.req.valid("json"));
      return success(c, toSanitizedUserDTO(user), "User updated successfully");
    },
  )
  .delete(
    "/:id",
    requireAuth,
    requireAdmin,
    zodValidator("param", uuidParamSchema),
    async (c) => {
      await UserService.softDelete(c.req.valid("param").id);
      return success(c, null, "User deleted successfully");
    },
  );
