ALTER TABLE "mappings" DROP CONSTRAINT "mappings_classification_config_version_id_classification_config_versions_id_fk";
--> statement-breakpoint
ALTER TABLE "mappings" DROP COLUMN "classification_config_version_id";--> statement-breakpoint
ALTER TABLE "mappings" ADD COLUMN "classification_config" jsonb;--> statement-breakpoint
ALTER TABLE "mappings" ADD COLUMN "use_active_config" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "shades" DROP CONSTRAINT "shades_classification_config_version_id_classification_config_versions_id_fk";
--> statement-breakpoint
ALTER TABLE "shades" DROP COLUMN "classification_config_version_id";--> statement-breakpoint
DROP INDEX "mappings_status_idx";--> statement-breakpoint
ALTER TABLE "mappings" DROP COLUMN "status";--> statement-breakpoint
DROP TYPE "public"."mapping_status";--> statement-breakpoint
ALTER TABLE "shades" ADD COLUMN "ingredients_inci" text;--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "ingredients_inci";
