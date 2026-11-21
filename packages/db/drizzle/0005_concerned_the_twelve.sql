CREATE TYPE "public"."report_issue_type" AS ENUM('wrong_color_mapping', 'incorrect_shade_data', 'missing_sku', 'other');--> statement-breakpoint
ALTER TYPE "public"."report_status" ADD VALUE 'closed';--> statement-breakpoint
ALTER TYPE "public"."report_status" ADD VALUE 'rejected';--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "issue_type" "report_issue_type" DEFAULT 'other' NOT NULL;--> statement-breakpoint
ALTER TABLE "reports" RENAME COLUMN "attachment_urls" TO "attachment_keys";--> statement-breakpoint
UPDATE "reports" SET "attachment_keys" = NULL;--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "product_id" uuid;--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "resolution_note" text;--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "feedback_note" text;--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "closed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "auto_closed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;