import {
  boolean,
  jsonb,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { mappingView } from "./enums.js";
import { productFormatItems } from "./product-formats.js";
import { users } from "./users.js";

export const mappings = pgTable(
  "mappings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id),
    name: varchar("name").notNull(),
    /** locked sub-category */
    productFormatItemId: integer("product_format_item_id")
      .notNull()
      .references(() => productFormatItems.id),
    /** shades inside this mapping (no FK possible on arrays) */
    shadeIds: uuid("shade_ids").array().notNull(),
    viewMode: mappingView("view_mode").notNull().default("season"),
    /** custom view only */
    axisX: varchar("axis_x"),
    axisY: varchar("axis_y"),
    showPhoto: boolean("show_photo").notNull().default(false),
    hideProductName: boolean("hide_product_name").notNull().default(false),
    /** this mapping's own cut-offs (ClassificationConfig): the active config copied at save, then edited by the user */
    classificationConfig: jsonb("classification_config"),
    /** true = Default (category's active config, read live), false = classificationConfig above */
    useActiveConfig: boolean("use_active_config").notNull().default(true),
    thumbnailUrl: text("thumbnail_url"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("mappings_owner_idx").on(t.ownerId),
    index("mappings_product_format_item_idx").on(t.productFormatItemId),
  ],
);

export const mappingPins = pgTable(
  "mapping_pins",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    mappingId: uuid("mapping_id")
      .notNull()
      .references(() => mappings.id, { onDelete: "cascade" }),
    pinnedAt: timestamp("pinned_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.mappingId] })],
);

export type Mapping = typeof mappings.$inferSelect;
export type NewMapping = typeof mappings.$inferInsert;
export type MappingPin = typeof mappingPins.$inferSelect;
export type NewMappingPin = typeof mappingPins.$inferInsert;
