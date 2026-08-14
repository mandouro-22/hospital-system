import "dotenv/config";
import { eq } from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";
import { db } from "../db";
import { account, user as users } from "../db/schema";

const name = process.env.ADMIN_NAME?.trim() || "System Administrator";
const email = (
  process.env.ADMIN_EMAIL?.trim() || "admin@hospital.com"
).toLowerCase();
const password = process.env.ADMIN_PASSWORD;

async function seedAdmin() {
  console.log("Starting admin seeding process...");

  if (!password || password.length < 8) {
    throw new Error(
      "ADMIN_PASSWORD must be set and contain at least 8 characters.",
    );
  }

  console.log("Validated ADMIN_PASSWORD length.");
  console.log(email);
  const [existingUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  console.log(`Checked database for existing admin user with email ${email}.`);

  if (existingUser) {
    console.log(
      `Admin account already exists for ${email}; no changes were made.`,
    );
    return;
  }

  console.log("No existing admin found; hashing password...");
  const hashedPassword = await hashPassword(password);
  console.log("Password hashed.");

  console.log("Creating admin user record...");
  await db.insert(users).values({
    name,
    email,
    emailVerified: true,
    role: "Admin",
    status: "active",
  });

  console.log("Admin user inserted. Fetching created user record...");
  const [admin] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!admin) {
    throw new Error("Failed to retrieve the created admin user.");
  }

  console.log(`Created admin user record with id ${admin.id}.`);
  console.log("Inserting admin account credentials...");
  await db.insert(account).values({
    userId: admin.id,
    accountId: admin.id,
    providerId: "credential",
    password: hashedPassword,
    updatedAt: new Date().toISOString(),
  });

  console.log("Inserted admin account credentials.");
  console.log(`Admin account created successfully for ${email}.`);
}

seedAdmin().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
