import { Hono } from "hono";
import { handle } from "hono/vercel";
import { errorHandler } from "@/lib/error-handler";
import { authRoutes } from "@/services/auth.routes";
import { userRoutes } from "@/services/user.routes";
import type { AuthVariables } from "@/features/auth/middleware/auth.middleware";

const app = new Hono<{ Variables: AuthVariables }>().basePath("/api");

app.onError(errorHandler);

app.route("/auth", authRoutes);
app.route("/users", userRoutes);

const handler = handle(app);
export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const DELETE = handler;