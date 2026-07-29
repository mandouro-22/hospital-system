import { Hono } from "hono";
import { loginSchema } from "@/features/auth/validations/login.schema";
import { requireAuth } from "@/features/auth/middleware/auth.middleware";
import { AuthService } from "@/features/auth/services/auth.service";
import { success } from "@/lib/response";
import { AppError } from "@/lib/errors";
import type { ApiError, AuthSession } from "@/features/auth/types/auth.types";
import type { AuthVariables } from "@/features/auth/middleware/auth.middleware";

const authRoutes = new Hono<{ Variables: AuthVariables }>();

authRoutes.post("/login", async (c) => {
  const body = await c.req.json().catch(() => {});
  const parsed = loginSchema.safeParse(body);

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

  const result = await AuthService.login(parsed.data, c.req.raw.headers);

  for (const cookie of result.response.headers.getSetCookie()) {
    c.header("Set-Cookie", cookie, { append: true });
  }

  return success(c, result.session, "Logged in successfully");
});

authRoutes.post("/logout", requireAuth, async (c) => {
  try {
    const baResponse = await AuthService.logout(c.req.raw.headers);

    for (const cookie of baResponse.headers.getSetCookie()) {
      c.header("Set-Cookie", cookie, { append: true });
    }
  } catch {
    // Proceed even if logout fails
  }

  return success(c, null, "Logged out successfully");
});

authRoutes.get("/session", async (c) => {
  const session = await AuthService.getSession(c.req.raw.headers);

  if (!session) {
    return c.json({ success: true, data: null });
  }

  return success(c, {
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      emailVerified: session.user.emailVerified,
      image: session.user.image,
      role: session.user.role,
      createdAt: session.user.createdAt,
      updatedAt: session.user.updatedAt,
    },
    session: {
      id: session.session.id,
      expiresAt: session.session.expiresAt,
      token: session.session.token,
    },
  });
});

authRoutes.get("/me", requireAuth, async (c) => {
  const user = await AuthService.getAuthenticatedUser(c.req.raw.headers);

  if (!user) {
    return c.json({ success: true, data: null });
  }

  return success(c, user);
});

export { authRoutes };