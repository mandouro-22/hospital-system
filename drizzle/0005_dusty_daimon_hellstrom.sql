CREATE SEQUENCE "doctor_number_seq" START WITH 1 INCREMENT BY 1;--> statement-breakpoint
ALTER TABLE "doctor" ADD COLUMN "doctor_number" varchar(20) DEFAULT 'DOC-' || lpad(nextval('doctor_number_seq')::text, 6, '0') NOT NULL;--> statement-breakpoint
ALTER TABLE "doctor" ADD CONSTRAINT "doctor_doctor_number_unique" UNIQUE("doctor_number");
