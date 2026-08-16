import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { UserRepository } from "../repositories/user.repository";
import { SessionRepository } from "../repositories/session.repository";
import { AppError } from "@/lib/errors";
import type { LoginInput } from "../validations/login.schema";
import type { AuthSession, AuthenticatedUserDTO } from "../types/auth.types";
import { toAuthSessionDTO } from "../dto/auth.dto";

export const AuthService = {
  async login(
    input: LoginInput,
    headers: Headers,
  ): Promise<{ session: AuthSession; response: Response }> {
    logger.debug("login.start", { email: input.email });

    // Step 1: Find user by email
    logger.debug("login.fetching_user", { email: input.email });
    const user = await UserRepository.findByEmail(input.email);

    if (!user) {
      logger.warn("login.failed", {
        email: input.email,
        reason: "user_not_found",
      });
      throw AppError.unauthorized("Invalid email or password");
    }
    logger.debug("login.user_found", {
      userId: user.id,
      email: input.email,
      status: user.status,
    });

    // Step 2: Check if account is deleted
    logger.debug("login.checking_deleted", {
      userId: user.id,
      email: input.email,
    });
    if (user.deletedAt) {
      logger.warn("login.failed", {
        email: input.email,
        reason: "account_deactivated",
        userId: user.id,
      });
      throw AppError.forbidden("Account has been deactivated");
    }
    logger.debug("login.account_not_deleted", { userId: user.id });

    // Step 3: Check account status
    logger.debug("login.checking_status", {
      userId: user.id,
      email: input.email,
      status: user.status,
    });
    if (user.status === "locked" || user.status === "suspended") {
      logger.warn("login.failed", {
        email: input.email,
        reason: "account_locked",
        status: user.status,
        userId: user.id,
      });
      throw AppError.forbidden("Account is locked or suspended");
    }
    logger.debug("login.account_status_valid", {
      userId: user.id,
      status: user.status,
    });

    // Step 4: Prepare authentication request
    logger.debug("login.preparing_auth_request", {
      userId: user.id,
      email: input.email,
    });
    const url = new URL(headers.get("origin") || "http://localhost:3000");
    url.pathname = "/api/better-auth/sign-in/email";
    logger.debug("login.auth_url", { url: url.toString() });

    const baHeaders = new Headers(headers);
    baHeaders.set("Content-Type", "application/json");
    logger.debug("login.auth_headers_prepared", {
      userId: user.id,
      headersPresent: Array.from(baHeaders.keys()),
    });

    const baRequest = new Request(url.toString(), {
      method: "POST",
      headers: baHeaders,
      body: JSON.stringify({ email: input.email, password: input.password }),
    });
    logger.debug("login.auth_request_created", {
      userId: user.id,
      method: baRequest.method,
      url: baRequest.url,
    });

    // Step 5: Call authentication handler
    logger.debug("login.calling_auth_handler", {
      userId: user.id,
      email: input.email,
    });
    const baResponse = await auth.handler(baRequest);

    // Step 6: Check authentication response
    logger.debug("login.auth_response_received", {
      userId: user.id,
      status: baResponse.status,
      ok: baResponse.ok,
    });

    if (!baResponse.ok) {
      logger.warn("login.failed", {
        email: input.email,
        reason: "invalid_credentials",
        status: baResponse.status,
        userId: user.id,
      });
      throw AppError.unauthorized("Invalid email or password");
    }
    logger.debug("login.auth_successful", { userId: user.id });

    // Step 7: Parse response data
    logger.debug("login.parsing_response", { userId: user.id });
    const data = (await baResponse.json()) as {
      token: string;
      user: Pick<
        AuthSession["user"],
        "id" | "name" | "email" | "emailVerified" | "image"
      >;
    };
    const session = await SessionRepository.findActiveByToken(data.token);

    if (!session) {
      throw AppError.internal("Failed to retrieve the created session");
    }

    const authSession: AuthSession = {
      user: {
        ...data.user,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      session: {
        ...session,
        expiresAt: new Date(session.expiresAt),
        createdAt: new Date(session.createdAt),
        updatedAt: new Date(session.updatedAt),
      },
    };
    logger.debug("login.response_parsed", {
      userId: authSession.user.id,
      email: authSession.user.email,
      sessionId: authSession.session.id,
    });

    // Step 8: Log success
    logger.info("login.success", {
      userId: authSession.user.id,
      email: input.email,
    });

    // Step 9: Update user record
    logger.debug("login.updating_user", {
      userId: authSession.user.id,
      email: input.email,
    });
    await UserRepository.update(authSession.user.id, {
      status: "active",
      lastLogin: new Date(),
    });
    logger.debug("login.user_updated", {
      userId: authSession.user.id,
      status: "active",
      lastLogin: new Date().toISOString(),
    });

    // Step 10: Return successful login
    logger.debug("login.completed", { userId: authSession.user.id });
    return {
      session: authSession,
      response: baResponse,
    };
  },

  async logout(headers: Headers): Promise<Response> {
    const session = await auth.api.getSession({ headers });

    if (session?.user) {
      logger.info("logout", {
        userId: session.user.id,
        email: session.user.email,
      });
    }

    const url = new URL(headers.get("origin") || "http://localhost:3000");
    url.pathname = "/api/better-auth/sign-out";

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

  async getAuthenticatedUser(
    headers: Headers,
  ): Promise<AuthenticatedUserDTO | null> {
    const session = await auth.api.getSession({ headers });
    if (!session) return null;

    const lastLogin = await SessionRepository.getLastLogin(session.user.id);
    return toAuthSessionDTO(session as AuthSession, lastLogin);
  },
};
