ALTER TYPE "public"."appointment_status" ADD VALUE 'pending' BEFORE 'confirmed';--> statement-breakpoint
ALTER TABLE "appointment_participants" ALTER COLUMN "split_rate" SET DATA TYPE numeric(10, 6);--> statement-breakpoint
ALTER TABLE "appointment_participants" ADD COLUMN "invoiced" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "appointment_participants" ADD COLUMN "invoice_ref" text;--> statement-breakpoint
ALTER TABLE "appointment_participants" ADD COLUMN "updated_at" timestamp;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "service_period_start" timestamp;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "service_period_end" timestamp;--> statement-breakpoint
ALTER TABLE "invoice_items" ADD COLUMN "support_category" varchar(255);