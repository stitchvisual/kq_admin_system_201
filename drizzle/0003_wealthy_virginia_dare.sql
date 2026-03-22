ALTER TABLE "invoices" ALTER COLUMN "updated_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "updated_at" DROP NOT NULL;