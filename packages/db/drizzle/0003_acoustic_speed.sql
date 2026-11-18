CREATE TABLE "mapping_folders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"name" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "mappings" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "mappings" ADD COLUMN "folder_id" uuid;--> statement-breakpoint
ALTER TABLE "mapping_folders" ADD CONSTRAINT "mapping_folders_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "mapping_folders_owner_idx" ON "mapping_folders" USING btree ("owner_id");--> statement-breakpoint
ALTER TABLE "mappings" ADD CONSTRAINT "mappings_folder_id_mapping_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."mapping_folders"("id") ON DELETE set null ON UPDATE no action;