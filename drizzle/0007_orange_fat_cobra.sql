CREATE SEQUENCE "receptionist_number_seq" START WITH 1 INCREMENT BY 1;--> statement-breakpoint
CREATE TABLE "receptionist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"receptionist_number" varchar(20) DEFAULT 'REC-' || lpad(nextval('receptionist_number_seq')::text, 6, '0') NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "receptionist_receptionist_number_unique" UNIQUE("receptionist_number")
);--> statement-breakpoint
ALTER TABLE "receptionist" ADD CONSTRAINT "receptionist_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
