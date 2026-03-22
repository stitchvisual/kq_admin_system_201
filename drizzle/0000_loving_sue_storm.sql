CREATE TYPE "public"."appointment_status" AS ENUM('confirmed', 'completed', 'cancelled');--> statement-breakpoint
CREATE TABLE "clients" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"ndis_number" varchar(20),
	"address" text,
	"suburb" varchar(100),
	"weekday_code" text,
	"saturday_code" text,
	"sunday_code" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp,
	CONSTRAINT "clients_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "appointment_participants" (
	"id" text PRIMARY KEY NOT NULL,
	"appointment_id" text NOT NULL,
	"client_id" text NOT NULL,
	"split_rate" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" text PRIMARY KEY NOT NULL,
	"client_id" text,
	"title" text,
	"starts_at" timestamp NOT NULL,
	"ends_at" timestamp NOT NULL,
	"status" "appointment_status" DEFAULT 'confirmed' NOT NULL,
	"notes" text,
	"invoiced" boolean DEFAULT false NOT NULL,
	"invoice_ref" text,
	"is_group" boolean DEFAULT false NOT NULL,
	"group_size" integer DEFAULT 1 NOT NULL,
	"rate_code" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" text PRIMARY KEY NOT NULL,
	"invoice_number" varchar(50) NOT NULL,
	"client_id" text NOT NULL,
	"invoice_date" timestamp DEFAULT now() NOT NULL,
	"due_date" timestamp NOT NULL,
	"total" numeric(10, 2) DEFAULT '0' NOT NULL,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"issued_at" timestamp,
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp,
	CONSTRAINT "invoices_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "invoice_items" (
	"id" text PRIMARY KEY NOT NULL,
	"invoice_id" text NOT NULL,
	"appointment_id" text,
	"description" text NOT NULL,
	"quantity" numeric(10, 2) NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"ndis_item_code" varchar(20),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ndis_pricing" (
	"id" text PRIMARY KEY NOT NULL,
	"category" varchar(100) NOT NULL,
	"support_item_code" varchar(50) NOT NULL,
	"support_item_name" varchar(255) NOT NULL,
	"unit" varchar(50) NOT NULL,
	"national_price" numeric(10, 2),
	"remote_price" numeric(10, 2),
	"very_remote_price" numeric(10, 2),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ndis_pricing_support_item_code_unique" UNIQUE("support_item_code")
);
--> statement-breakpoint
ALTER TABLE "appointment_participants" ADD CONSTRAINT "appointment_participants_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointment_participants" ADD CONSTRAINT "appointment_participants_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE set null ON UPDATE no action;