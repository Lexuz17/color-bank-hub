import { integer, pgTable, uniqueIndex, varchar } from "drizzle-orm/pg-core";

/** Category, e.g. Lip Product, Blush, Eyeshadow */
export const productFormats = pgTable("product_formats", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name").notNull().unique(),
  sortOrder: integer("sort_order").notNull().default(0),
});

/** Sub-category, e.g. Lipstick Matte, Liquid Blush */
export const productFormatItems = pgTable(
  "product_format_items",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    formatId: integer("format_id")
      .notNull()
      .references(() => productFormats.id),
    name: varchar("name").notNull(),
    code: varchar("code", { length: 4 })
      .notNull()
      .unique() /** SM SG B TG TM TW LM LV V BP BL EM ES */,
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [
    uniqueIndex("product_format_items_format_name_uq").on(t.formatId, t.name),
  ],
);

export type ProductFormat = typeof productFormats.$inferSelect;
export type NewProductFormat = typeof productFormats.$inferInsert;
export type ProductFormatItem = typeof productFormatItems.$inferSelect;
export type NewProductFormatItem = typeof productFormatItems.$inferInsert;
