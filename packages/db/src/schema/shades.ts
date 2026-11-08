import {
  char,
  index,
  jsonb,
  numeric,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { classificationConfigVersions } from "./classification.js";
import { season, undertone } from "./enums.js";
import { products } from "./products.js";
import { users } from "./users.js";

export const shades = pgTable(
  "shades",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),
    /** own products only; external benchmark shades have none */
    sku: varchar("sku").unique(),
    name: varchar("name").notNull(),
    hex: char("hex", { length: 7 }).notNull(),
    mayContain: text("may_contain"),
    /** storage object keys, see contracts/upload.ts */
    lipPhotoKey: text("lip_photo_key"),
    swatchPhotoKey: text("swatch_photo_key"),

    /** own brand only, hidden from PID */
    composition: jsonb("composition"),

    // computed from hex, see contracts/color.ts
    r: smallint("r"),
    g: smallint("g"),
    b: smallint("b"),
    hslH: numeric("hsl_h", { precision: 5, scale: 2, mode: "number" }),
    hslS: numeric("hsl_s", { precision: 5, scale: 2, mode: "number" }),
    hslL: numeric("hsl_l", { precision: 5, scale: 2, mode: "number" }),
    hsbS: numeric("hsb_s", { precision: 5, scale: 2, mode: "number" }),
    hsbB: numeric("hsb_b", { precision: 5, scale: 2, mode: "number" }),
    labL: numeric("lab_l", { precision: 6, scale: 2, mode: "number" }),
    labA: numeric("lab_a", { precision: 6, scale: 2, mode: "number" }),
    labB: numeric("lab_b", { precision: 6, scale: 2, mode: "number" }),
    lchL: numeric("lch_l", { precision: 6, scale: 2, mode: "number" }),
    lchC: numeric("lch_c", { precision: 6, scale: 2, mode: "number" }),
    lchH: numeric("lch_h", { precision: 5, scale: 2, mode: "number" }),

    // classification (computed, driven by classification_config_versions)
    undertone: undertone("undertone"),
    season: season("season"),
    /** e.g. Red, Yellow-Red, Red-Purple */
    hueMunsell: varchar("hue_munsell"),
    colorFamily: varchar("color_family"),
    /** warm / neutral / cool within a family */
    colorSub: varchar("color_sub"),
    valueClass: varchar("value_class"),
    chromaClass: varchar("chroma_class"),
    depthLevel: smallint("depth_level"),

    classificationConfigVersionId: uuid(
      "classification_config_version_id",
    ).references(
      /** config used when computed */
      () => classificationConfigVersions.id,
    ),

    createdBy: uuid("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    uniqueIndex("shades_product_name_uq").on(t.productId, t.name),
    index("shades_product_idx").on(t.productId),
    index("shades_season_idx").on(t.season),
    index("shades_undertone_idx").on(t.undertone),
    index("shades_color_family_idx").on(t.colorFamily),
    index("shades_depth_level_idx").on(t.depthLevel),
    index("shades_hue_lightness_idx").on(t.hslH, t.hslL),
  ],
);

/**
 * Own shade "benchmarked to" an external shade. Read the other way it is
 * "benchmark for". A shade is flagged `benchmarked` when it has a row here.
 */
export const shadeBenchmarks = pgTable(
  "shade_benchmarks",
  {
    shadeId: uuid("shade_id")
      .notNull()
      .references(() => shades.id, { onDelete: "cascade" }),
    benchmarkShadeId: uuid("benchmark_shade_id")
      .notNull()
      .references(() => shades.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.shadeId, t.benchmarkShadeId] }),
    index("shade_benchmarks_benchmark_idx").on(t.benchmarkShadeId),
  ],
);

export type Shade = typeof shades.$inferSelect;
export type NewShade = typeof shades.$inferInsert;
export type ShadeBenchmark = typeof shadeBenchmarks.$inferSelect;
