import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { UserRepository } from "../repositories/user.repository";
import { SessionRepository } from "../repositories/session.repository";
import { AppError } from "@/lib/errors";
import type { LoginInput } from "../validations/login.schema";
import type { AuthSession, AuthenticatedUser } from "../types/auth.types";
import { toAuthSessionDTO } from "../dto/auth.dto";

export const AuthService = {
  async login(input: LoginInput, headers: Headers): Promise<{ session: AuthSession; response: Response }> {
    const user = await UserRepository.findByEmail(input.email);

    if (!user) {
      logger.warn("login.failed", { email: input.email, reason: "user_not_found" });
      throw AppError.unauthorized("Invalid email or password");
    }

    if (user.deletedAt) {
      logger.warn("login.failed", { email: input.email, reason: "account_deactivated" });
      throw AppError.forbidden("Account has been deactivated");
    }

    const url = new URL(headers.get("origin") || "http://localhost:3000");
    url.pathname = "/api/auth/sign-in/email";

    const baHeaders = new Headers(headers);
    baHeaders.set("Content-Type", "application/json");

    const baRequest = new Request(url.toString(), {
      method: "POST",
      headers: baHeaders,
      body: JSON.stringify({ email: input.email, password: input.password }),
    });

    const baResponse = await auth.handler(baRequest);

    if (!baResponse.ok) {
      logger.warn("login.failed", { email: input.email, reason: "invalid_credentials" });
      throw AppError.unauthorized("Invalid email or password");
    }

    const data = (await baResponse.json()) as { user: AuthSession["user"]; session: AuthSession["session"] };

    logger.info("login.success", { userId: data.user.id, email: input.email });

    return {
      session: data as AuthSession,
      response: baResponse,
    };
  },

  async logout(headers: Headers): Promise<Response> {
    const session = await auth.api.getSession({ headers });

    if (session?.user) {
      logger.info("logout", { userId: session.user.id, email: session.user.email });
    }

    const url = new URL(headers.get("origin") || "http://localhost:3000");
    url.pathname = "/api/auth/sign-out";

    const baRequest = new Request(url.toString(), {
      method: "POST",
      headers,
    });

    return auth.handler(baRequest);
  },

  async getSession(headers: Headers): Promise<AuthSession | null> {
    const session = await auth.api.getSession({ headers });
    if (!session) return null;
    return session as AuthSession;
  },

  async getAuthenticatedUser(headers: Headers): Promise<AuthenticatedUser | null> {
    const session = await auth.api.getSession({ headers });
    if (!session) return null;

    const lastLogin = await SessionRepository.getLastLogin(session.user.id);
    return toAuthSessionDTO(session as AuthSession, lastLogin);
  },
};