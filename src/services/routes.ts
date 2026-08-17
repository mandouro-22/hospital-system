import { Hono } from "hono";
import type { ExtractSchema } from "hono/types";
import { errorHandler } from "@/lib/error-handler";
import { authRoutes } from "@/services/auth.routes";
import { departmentRoutes } from "@/services/department.routes";
import { doctorRoutes } from "@/services/doctor.routes";
import { userRoutes } from "@/services/user.routes";
import { receptionistRoutes } from "@/services/receptionist.routes";
import { patientRoutes } from "@/services/patient.routes";
import type { AuthVariables } from "@/features/auth/middleware/auth.middleware";

export const apiRoutes = new Hono<{ Variables: AuthVariables }>()
  .basePath("/api")
  .onError(errorHandler)
  .route("/auth", authRoutes)
  .route("/departments", departmentRoutes)
  .route("/doctors", doctorRoutes)
  .route("/users", userRoutes)
  .route("/receptionists", receptionistRoutes)
  .route("/patients", patientRoutes);

type AppSchema = ExtractSchema<typeof apiRoutes>;

export type AppType = Hono<{ Variables: AuthVariables }, AppSchema, "/api">;
