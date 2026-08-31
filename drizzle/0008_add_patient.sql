CREATE SEQUENCE "public"."patient_number_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE TABLE "patient" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"phn" varchar(50) NOT NULL,
	"patient_number" varchar(20) DEFAULT ('PAT-'::text || lpad((nextval('patient_number_seq'::regclass))::text, 6, '0'::text)) NOT NULL,
	"phone" varchar(20),
	"gender" varchar(20),
	"date_of_birth" timestamp with time zone,
	"address" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "patient_phn_unique" UNIQUE("phn")
);--> statement-breakpoint
ALTER TABLE "patient" ADD CONSTRAINT "patient_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "patient_patient_number_unique" ON "patient" USING btree ("patient_number" text_ops);