import { handle } from "hono/vercel";
import { apiRoutes } from "@/services/routes";

const handler = handle(apiRoutes);
export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const PUT = handler;
export const DELETE = handler;
