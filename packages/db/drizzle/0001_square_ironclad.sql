CREATE TYPE "public"."approval_status" AS ENUM('pending', 'approved', 'declined');--> statement-breakpoint
CREATE TYPE "public"."color_model" AS ENUM('hsl', 'lab', 'lch');--> statement-breakpoint
CREATE TYPE "public"."mapping_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TYPE "public"."mapping_view" AS ENUM('season', 'color_family', 'custom');--> statement-breakpoint
CREATE TYPE "public"."priority_level" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."report_status" AS ENUM('pending', 'resolved');--> statement-breakpoint
CREATE TYPE "public"."request_status" AS ENUM('pending', 'approved', 'formulating', 'completed', 'declined');--> statement-breakpoint
CREATE TYPE "public"."request_type" AS ENUM('benchmark_matching', 'gap_filling');--> statement-breakpoint
CREATE TYPE "public"."season" AS ENUM('spring', 'summer', 'autumn', 'winter');--> statement-breakpoint
CREATE TYPE "public"."undertone" AS ENUM('warm', 'neutral', 'cool');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('website_admin', 'rnd', 'pid', 'tsi');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('pending', 'active', 'disabled');--> statement-breakpoint
CREATE TABLE "role_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"requested_role" "user_role" NOT NULL,
	"status" "approval_status" DEFAULT 'pending' NOT NULL,
	"decided_by" uuid,
	"decided_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "audit_logs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"actor_id" uuid,
	"action" varchar NOT NULL,
	"target_type" varchar NOT NULL,
	"target_id" varchar NOT NULL,
	"before" jsonb,
	"after" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brands" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"is_own" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "brands_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "product_format_items" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "product_format_items_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"format_id" integer NOT NULL,
	"name" varchar NOT NULL,
	"code" varchar(4) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "product_format_items_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "product_formats" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "product_formats_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "product_formats_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand_id" uuid NOT NULL,
	"format_item_id" integer NOT NULL,
	"name" varchar NOT NULL,
	"base_type" varchar,
	"ingredients_inci" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "classification_config_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"color_model" "color_model" NOT NULL,
	"version" integer NOT NULL,
	"schema_version" integer DEFAULT 1 NOT NULL,
	"config" jsonb NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"note" varchar,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shades" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"sku" varchar NOT NULL,
	"name" varchar NOT NULL,
	"hex" char(7) NOT NULL,
	"may_contain" text,
	"lip_photo_url" text,
	"swatch_photo_url" text,
	"composition" jsonb,
	"benchmarks" jsonb,
	"r" smallint,
	"g" smallint,
	"b" smallint,
	"hsl_h" numeric(5, 2),
	"hsl_s" numeric(5, 2),
	"hsl_l" numeric(5, 2),
	"hsb_s" numeric(5, 2),
	"hsb_b" numeric(5, 2),
	"lab_l" numeric(6, 2),
	"lab_a" numeric(6, 2),
	"lab_b" numeric(6, 2),
	"lch_l" numeric(6, 2),
	"lch_c" numeric(6, 2),
	"lch_h" numeric(5, 2),
	"undertone" "undertone",
	"season" "season",
	"color_family" varchar,
	"color_sub" varchar,
	"value_class" varchar,
	"chroma_class" varchar,
	"depth_level" smallint,
	"classification_config_id" uuid,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "shades_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "mapping_pins" (
	"user_id" uuid NOT NULL,
	"mapping_id" uuid NOT NULL,
	"pinned_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "mapping_pins_user_id_mapping_id_pk" PRIMARY KEY("user_id","mapping_id")
);
--> statement-breakpoint
CREATE TABLE "mappings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"name" varchar NOT NULL,
	"format_item_id" integer NOT NULL,
	"shade_ids" uuid[] NOT NULL,
	"view_mode" "mapping_view" DEFAULT 'season' NOT NULL,
	"axis_x" varchar,
	"axis_y" varchar,
	"show_photo" boolean DEFAULT false NOT NULL,
	"hide_product_name" boolean DEFAULT false NOT NULL,
	"status" "mapping_status" DEFAULT 'draft' NOT NULL,
	"classification_config_id" uuid,
	"thumbnail_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prototype_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"requester_id" uuid NOT NULL,
	"type" "request_type" NOT NULL,
	"priority" "priority_level" NOT NULL,
	"description" text,
	"brand_id" uuid,
	"brand_name_new" varchar,
	"product_id" uuid,
	"product_name_new" varchar,
	"shade_id" uuid,
	"shade_name_new" varchar,
	"target_hex" char(7),
	"format_item_id" integer NOT NULL,
	"target_season" "season",
	"sequence_no" integer,
	"auto_name" varchar,
	"status" "request_status" DEFAULT 'pending' NOT NULL,
	"decided_by" uuid,
	"decided_at" timestamp with time zone,
	"decline_reason" text,
	"base_type" varchar,
	"ingredients_inci" text,
	"may_contain" text,
	"composition" jsonb,
	"result_photo_url" text,
	"delta_e" numeric(5, 2),
	"result_notes" text,
	"result_shade_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reporter_id" uuid NOT NULL,
	"brand_id" uuid,
	"shade_id" uuid,
	"description" text NOT NULL,
	"attachment_urls" text[],
	"priority" "priority_level" DEFAULT 'medium' NOT NULL,
	"status" "report_status" DEFAULT 'pending' NOT NULL,
	"resolved_by" uuid,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE uuid USING gen_random_uuid();--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
DROP SEQUENCE IF EXISTS "users_id_seq";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "name" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "image" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" "user_role";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "status" "user_status" DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_login_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "role_requests" ADD CONSTRAINT "role_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_requests" ADD CONSTRAINT "role_requests_decided_by_users_id_fk" FOREIGN KEY ("decided_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_format_items" ADD CONSTRAINT "product_format_items_format_id_product_formats_id_fk" FOREIGN KEY ("format_id") REFERENCES "public"."product_formats"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_format_item_id_product_format_items_id_fk" FOREIGN KEY ("format_item_id") REFERENCES "public"."product_format_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classification_config_versions" ADD CONSTRAINT "classification_config_versions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shades" ADD CONSTRAINT "shades_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shades" ADD CONSTRAINT "shades_classification_config_id_classification_config_versions_id_fk" FOREIGN KEY ("classification_config_id") REFERENCES "public"."classification_config_versions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shades" ADD CONSTRAINT "shades_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mapping_pins" ADD CONSTRAINT "mapping_pins_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mapping_pins" ADD CONSTRAINT "mapping_pins_mapping_id_mappings_id_fk" FOREIGN KEY ("mapping_id") REFERENCES "public"."mappings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mappings" ADD CONSTRAINT "mappings_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mappings" ADD CONSTRAINT "mappings_format_item_id_product_format_items_id_fk" FOREIGN KEY ("format_item_id") REFERENCES "public"."product_format_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mappings" ADD CONSTRAINT "mappings_classification_config_id_classification_config_versions_id_fk" FOREIGN KEY ("classification_config_id") REFERENCES "public"."classification_config_versions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prototype_requests" ADD CONSTRAINT "prototype_requests_requester_id_users_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prototype_requests" ADD CONSTRAINT "prototype_requests_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prototype_requests" ADD CONSTRAINT "prototype_requests_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prototype_requests" ADD CONSTRAINT "prototype_requests_shade_id_shades_id_fk" FOREIGN KEY ("shade_id") REFERENCES "public"."shades"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prototype_requests" ADD CONSTRAINT "prototype_requests_format_item_id_product_format_items_id_fk" FOREIGN KEY ("format_item_id") REFERENCES "public"."product_format_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prototype_requests" ADD CONSTRAINT "prototype_requests_decided_by_users_id_fk" FOREIGN KEY ("decided_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prototype_requests" ADD CONSTRAINT "prototype_requests_result_shade_id_shades_id_fk" FOREIGN KEY ("result_shade_id") REFERENCES "public"."shades"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_shade_id_shades_id_fk" FOREIGN KEY ("shade_id") REFERENCES "public"."shades"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "role_requests_user_status_idx" ON "role_requests" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "audit_logs_target_idx" ON "audit_logs" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "product_format_items_format_name_uq" ON "product_format_items" USING btree ("format_id","name");--> statement-breakpoint
CREATE UNIQUE INDEX "products_brand_name_uq" ON "products" USING btree ("brand_id","name");--> statement-breakpoint
CREATE INDEX "products_format_item_idx" ON "products" USING btree ("format_item_id");--> statement-breakpoint
CREATE UNIQUE INDEX "classification_config_model_version_uq" ON "classification_config_versions" USING btree ("color_model","version");--> statement-breakpoint
CREATE UNIQUE INDEX "classification_config_one_active_per_model_uq" ON "classification_config_versions" USING btree ("color_model") WHERE "classification_config_versions"."is_active";--> statement-breakpoint
CREATE INDEX "shades_product_idx" ON "shades" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "shades_season_idx" ON "shades" USING btree ("season");--> statement-breakpoint
CREATE INDEX "shades_undertone_idx" ON "shades" USING btree ("undertone");--> statement-breakpoint
CREATE INDEX "shades_color_family_idx" ON "shades" USING btree ("color_family");--> statement-breakpoint
CREATE INDEX "shades_depth_level_idx" ON "shades" USING btree ("depth_level");--> statement-breakpoint
CREATE INDEX "shades_hue_lightness_idx" ON "shades" USING btree ("hsl_h","hsl_l");--> statement-breakpoint
CREATE INDEX "mappings_owner_idx" ON "mappings" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "mappings_format_item_idx" ON "mappings" USING btree ("format_item_id");--> statement-breakpoint
CREATE INDEX "mappings_status_idx" ON "mappings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "prototype_requests_status_idx" ON "prototype_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "prototype_requests_requester_idx" ON "prototype_requests" USING btree ("requester_id");--> statement-breakpoint
CREATE INDEX "prototype_requests_created_at_idx" ON "prototype_requests" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "prototype_requests_format_seq_uq" ON "prototype_requests" USING btree ("format_item_id","sequence_no");--> statement-breakpoint
CREATE INDEX "reports_status_idx" ON "reports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "reports_created_at_idx" ON "reports" USING btree ("created_at");