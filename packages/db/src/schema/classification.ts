import { sql } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { productFormats } from "./product-formats.js";
import { users } from "./users.js";

/** Classification thresholds per category; cut-offs can differ per category. */
export const classificationConfigVersions = pgTable(
  "classification_config_versions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productFormatId: integer("product_format_id")
      .notNull()
      .references(() => productFormats.id),
    version: integer("version").notNull(),
    /** ClassificationConfig from contracts/color-classification.ts (each label group sets its hsl/lch model) */
    config: jsonb("config").notNull(),
    isActive: boolean("is_active").notNull().default(false),
    note: varchar("note"),
    createdBy: uuid("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("classification_config_versions_product_format_version_uq").on(
      t.productFormatId,
      t.version,
    ),
    // only one active config per category
    uniqueIndex(
      "classification_config_versions_one_active_per_product_format_uq",
    )
      .on(t.productFormatId)
      .where(sql`${t.isActive}`),
  ],
);

export type ClassificationConfigVersion =
  typeof classificationConfigVersions.$inferSelect;
export type NewClassificationConfigVersion =
  typeof classificationConfigVersions.$inferInsert;
