import "dotenv/config";
import { randomUUID } from "crypto";
import { db } from "../db";
import { department } from "../db/schema";

const departmentNames = [
  "Cardiology Department",
  "Dermatology Department",
  "Endocrinology Department",
  "Gastroenterology Department",
  "Hematology Department",
  "Infectious Disease Department",
  "Internal Medicine Department",
  "Nephrology Department",
  "Neurology Department",
  "Oncology Department",
  "Ophthalmology Department",
  "Orthopedics Department",
  "ENT Department",
  "Pediatrics Department",
  "Psychiatry Department",
  "Pulmonology Department",
  "Rheumatology Department",
  "Urology Department",
  "Surgery Department",
  "Emergency Medicine Department",
  "Anesthesiology Department",
  "Radiology Department",
  "Pathology Department",
  "Obstetrics & Gynecology Department",
] as const;

async function seedDepartments() {
  const insertedDepartments = await db
    .insert(department)
    .values(departmentNames.map((name) => ({ id: randomUUID(), name })))
    .onConflictDoNothing({ target: department.name })
    .returning({ id: department.id, name: department.name });

  console.log(
    `Department seed complete: ${insertedDepartments.length} inserted, ${departmentNames.length - insertedDepartments.length} already existed.`,
  );
}

seedDepartments().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
