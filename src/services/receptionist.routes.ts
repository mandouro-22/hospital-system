import { Hono } from "hono";
import { zodValidator } from "@/lib/zod-validator";
import {
  requireAdmin,
  requireAuth,
} from "@/features/auth/middleware/auth.middleware";
import { uuidParamSchema } from "@/features/auth/validations/params.schema";
import { receptionistListSchema } from "@/features/receptionists/validations/receptionist.schema";
import { updateReceptionistSchema } from "@/features/receptionists/validations/receptionist.schema";
import {
  toReceptionistDetailDTO,
  toReceptionistListDTO,
} from "@/features/receptionists/dto/receptionist.dto";
import { ReceptionistService } from "@/features/receptionists/services/receptionist.service";
import { paginated, success } from "@/lib/response";
import type { AuthVariables } from "@/features/auth/middleware/auth.middleware";

export const receptionistRoutes = new Hono<{ Variables: AuthVariables }>()
  .get(
    "/",
    requireAuth,
    requireAdmin,
    zodValidator("query", receptionistListSchema),
    async (c) => {
      const result = await ReceptionistService.findAll(c.req.valid("query"));
      return paginated(
        c,
        result.data.map(toReceptionistListDTO),
        result.pagination,
      );
    },
  )
  .get(
    "/:id",
    requireAuth,
    requireAdmin,
    zodValidator("param", uuidParamSchema),
    async (c) => {
      const receptionist = await ReceptionistService.findById(
        c.req.valid("param").id,
      );
      return success(c, toReceptionistDetailDTO(receptionist));
    },
  )
  .patch(
    "/:id",
    requireAuth,
    requireAdmin,
    zodValidator("param", uuidParamSchema),
    zodValidator("json", updateReceptionistSchema),
    async (c) => {
      const receptionist = await ReceptionistService.update(
        c.req.valid("param").id,
        c.req.valid("json"),
      );
      return success(
        c,
        toReceptionistDetailDTO(receptionist),
        "Receptionist updated successfully",
      );
    },
  );
