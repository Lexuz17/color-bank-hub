import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { brands } from "./brands";
import { productFormatItems } from "./product-formats";

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    brandId: uuid("brand_id")
      .notNull()
      .references(() => brands.id),
    formatItemId: integer("format_item_id")
      .notNull()
      .references(() => productFormatItems.id),
    name: varchar("name").notNull(),
    /** Anhydrous / Emulsion / Semisolid / Oil-based */
    baseType: varchar("base_type"),
    ingredientsInci: text("ingredients_inci"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    uniqueIndex("products_brand_name_uq").on(t.brandId, t.name),
    index("products_format_item_idx").on(t.formatItemId),
  ],
);

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
