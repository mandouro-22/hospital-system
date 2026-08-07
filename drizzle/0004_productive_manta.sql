ALTER TABLE "department" ALTER COLUMN "id" SET DATA TYPE uuid USING "id"::uuid;--> statement-breakpoint
ALTER TABLE "department" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "staff" ALTER COLUMN "department_id" SET DATA TYPE uuid USING "department_id"::uuid;
