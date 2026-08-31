CREATE TABLE "appointment_configuration" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"default_duration" varchar(20) DEFAULT '30 min' NOT NULL,
	"enabled_statuses" text[] DEFAULT ARRAY['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show']::text[] NOT NULL,
	"cancellation_notice_hours" integer DEFAULT 24 NOT NULL,
	"require_doctor_schedule" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hospital_working_hours" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"day_of_week" integer NOT NULL,
	"is_closed" boolean DEFAULT false NOT NULL,
	"start_time" varchar(5),
	"end_time" varchar(5),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "hospital_working_hours_day_of_week_unique" UNIQUE("day_of_week")
);
--> statement-breakpoint
INSERT INTO "appointment_configuration" ("id") VALUES ('default');
--> statement-breakpoint
INSERT INTO "hospital_working_hours" ("day_of_week", "is_closed", "start_time", "end_time") VALUES
  (0, true, NULL, NULL),
  (1, false, '09:00', '17:00'),
  (2, false, '09:00', '17:00'),
  (3, false, '09:00', '17:00'),
  (4, false, '09:00', '17:00'),
  (5, false, '09:00', '14:00'),
  (6, true, NULL, NULL);
