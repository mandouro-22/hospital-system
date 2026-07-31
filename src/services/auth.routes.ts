import { Hono } from "hono";
import { zodValidator } from "@/lib/zod-validator";
import { loginSchema } from "@/features/auth/validations/login.schema";
import { requireAuth } from "@/features/auth/middleware/auth.middleware";
import { AuthService } from "@/features/auth/services/auth.service";
import { success } from "@/lib/response";
import { toSessionDTO } from "@/features/auth/dto/auth.dto";
import type { AuthVariables } from "@/features/auth/middleware/auth.middleware";

export const authRoutes = new Hono<{ Variables: AuthVariables }>()
  .post(
    "/login",
    zodValidator("json", loginSchema),
    async (c) => {
      const result = await AuthService.login(c.req.valid("json"), c.req.raw.headers);

      for (const cookie of result.response.headers.getSetCookie()) {
        c.header("Set-Cookie", cookie, { append: true });
      }

      return success(c, toSessionDTO(result.session), "Logged in successfully");
    },
  )
  .post("/logout", requireAuth, async (c) => {
    try {
      const baResponse = await AuthService.logout(c.req.raw.headers);

      for (const cookie of baResponse.headers.getSetCookie()) {
        c.header("Set-Cookie", cookie, { append: true });
      }
    } catch {
      // Proceed even if logout fails
    }

    return success(c, null, "Logged out successfully");
  })
  .get("/session", async (c) => {
    const session = await AuthService.getSession(c.req.raw.headers);

    if (!session) {
      return c.json({ success: true, data: null } as const);
    }

    return success(c, toSessionDTO(session));
  })
  .get("/me", requireAuth, async (c) => {
    const user = await AuthService.getAuthenticatedUser(c.req.raw.headers);

    if (!user) {
      return c.json({ success: true, data: null } as const);
    }

    return success(c, user);
  });
