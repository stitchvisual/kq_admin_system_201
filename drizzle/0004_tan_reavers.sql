CREATE TABLE "events" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"tag" varchar(50) DEFAULT 'Community' NOT NULL,
	"event_date" timestamp NOT NULL,
	"end_date" timestamp,
	"time" text NOT NULL,
	"location" text NOT NULL,
	"image_url" text,
	"is_published" boolean DEFAULT false NOT NULL,
	"show_on_home" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "travel_km" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "emailed_at" timestamp;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "resend_email_id" text;