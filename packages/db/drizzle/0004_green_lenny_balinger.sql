ALTER TABLE "role_requests" ALTER COLUMN "requested_role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
UPDATE "role_requests" SET "requested_role" = 'admin' WHERE "requested_role" = 'website_admin';--> statement-breakpoint
UPDATE "users" SET "role" = 'admin' WHERE "role" = 'website_admin';--> statement-breakpoint
DROP TYPE "public"."user_role";--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'rnd', 'pid', 'tsi');--> statement-breakpoint
ALTER TABLE "role_requests" ALTER COLUMN "requested_role" SET DATA TYPE "public"."user_role" USING "requested_role"::"public"."user_role";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE "public"."user_role" USING "role"::"public"."user_role";