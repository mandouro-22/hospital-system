import "dotenv/config";
import { eq } from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";
import { db } from "../db";
import { account, user as users, patient } from "../db/schema";

type PatientSeed = {
  name: string;
  email: string;
  phn: string;
  phone: string;
  gender: string;
  dateOfBirth: string;
  address: string;
};

const patients: PatientSeed[] = [
  {
    name: "Ahmed Hassan",
    email: "ahmed.hassan@example.com",
    phn: "PHN-100001",
    phone: "01000000001",
    gender: "Male",
    dateOfBirth: "1990-05-12",
    address: "12 Cairo Street, Cairo, Egypt",
  },
  {
    name: "Mohamed Ali",
    email: "mohamed.ali@example.com",
    phn: "PHN-100002",
    phone: "01000000002",
    gender: "Male",
    dateOfBirth: "1985-08-23",
    address: "45 Alexandria Road, Alexandria, Egypt",
  },
  {
    name: "Fatima Omar",
    email: "fatima.omar@example.com",
    phn: "PHN-100003",
    phone: "01000000003",
    gender: "Female",
    dateOfBirth: "1995-01-30",
    address: "8 Nasr City, Cairo, Egypt",
  },
];

const seedPassword = process.env.PATIENT_PASSWORD || "Patient@123";

async function seedPatients() {
  for (const patientSeed of patients) {
    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, patientSeed.email))
      .limit(1);

    if (existingUser) {
      console.log(
        `Patient account already exists for ${patientSeed.email}; skipping.`,
      );
      continue;
    }

    const [existingPhn] = await db
      .select({ id: patient.id })
      .from(patient)
      .where(eq(patient.phn, patientSeed.phn))
      .limit(1);

    if (existingPhn) {
      console.log(`Patient PHN ${patientSeed.phn} already exists; skipping.`);
      continue;
    }

    const hashedPassword = await hashPassword(seedPassword);

    const [createdUser] = await db
      .insert(users)
      .values({
        name: patientSeed.name,
        email: patientSeed.email,
        emailVerified: false,
        role: "Patient",
        status: "active",
      })
      .returning({ id: users.id });

    if (!createdUser) {
      throw new Error(`Failed to create user for ${patientSeed.email}`);
    }

    await db
      .insert(patient)
      .values({
        userId: createdUser.id,
        phn: patientSeed.phn,
        phone: patientSeed.phone,
        gender: patientSeed.gender,
        dateOfBirth: `${patientSeed.dateOfBirth}T00:00:00.000Z`,
        address: patientSeed.address,
      });

    await db.insert(account).values({
      userId: createdUser.id,
      accountId: createdUser.id,
      providerId: "credential",
      password: hashedPassword,
      updatedAt: new Date().toISOString(),
    });

    console.log(`Seeded patient ${patientSeed.name} (${patientSeed.email}).`);
  }
}

seedPatients().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});