import { asc } from "drizzle-orm";
import { db } from "@/db";
import { department } from "@/db/auth-schema";
import type { DepartmentOption } from "../types/department.types";

export const DepartmentRepository = {
  async findAll(): Promise<DepartmentOption[]> {
    return db
      .select({ id: department.id, name: department.name })
      .from(department)
      .orderBy(asc(department.name));
  },
};
