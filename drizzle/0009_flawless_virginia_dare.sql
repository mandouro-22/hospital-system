CREATE TABLE "specialty" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "specialty_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "department" ADD COLUMN "status" varchar(20) DEFAULT 'active' NOT NULL;