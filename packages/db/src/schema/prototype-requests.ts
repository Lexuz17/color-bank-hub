import {
  char,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { brands } from "./brands";
import { priorityLevel, requestStatus, requestType, season } from "./enums";
import { productFormatItems } from "./product-formats";
import { products } from "./products";
import { shades } from "./shades";
import { users } from "./users";

export const prototypeRequests = pgTable(
  "prototype_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    requesterId: uuid("requester_id")
      .notNull()
      .references(() => users.id),
    type: requestType("type").notNull(),
    priority: priorityLevel("priority").notNull(),
    description: text("description"),

    // pick from list (FK) or type a new one (text),
    // nothing goes to master tables before approval
    brandId: uuid("brand_id").references(() => brands.id),
    brandNameNew: varchar("brand_name_new"),
    productId: uuid("product_id").references(() => products.id),
    productNameNew: varchar("product_name_new"),
    shadeId: uuid("shade_id").references(() => shades.id),
    shadeNameNew: varchar("shade_name_new"),
    targetHex: char("target_hex", { length: 7 }),

    /** sub category */
    formatItemId: integer("format_item_id")
      .notNull()
      .references(() => productFormatItems.id),
    targetSeason: season("target_season"),

    // naming, generated on approval
    /** running number per format_item */
    sequenceNo: integer("sequence_no"),
    autoName: varchar("auto_name"),

    /** pending > approved > formulating > completed (or declined) */
    status: requestStatus("status").notNull().default("pending"),
    decidedBy: uuid("decided_by").references(() => users.id, {
      onDelete: "set null",
    }),
    decidedAt: timestamp("decided_at", { withTimezone: true }),
    declineReason: text("decline_reason"),

    // formulating stage
    baseType: varchar("base_type"),
    ingredientsInci: text("ingredients_inci"),
    mayContain: text("may_contain"),
    composition: jsonb("composition"),
    resultPhotoUrl: text("result_photo_url"),
    deltaE: numeric("delta_e", { precision: 5, scale: 2, mode: "number" }),
    resultNotes: text("result_notes"),
    /** master shade created on completed */
    resultShadeId: uuid("result_shade_id").references(() => shades.id),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("prototype_requests_status_idx").on(t.status),
    index("prototype_requests_requester_idx").on(t.requesterId),
    index("prototype_requests_created_at_idx").on(t.createdAt),
    uniqueIndex("prototype_requests_format_seq_uq").on(
      t.formatItemId,
      t.sequenceNo,
    ),
  ],
);

export type PrototypeRequest = typeof prototypeRequests.$inferSelect;
export type NewPrototypeRequest = typeof prototypeRequests.$inferInsert;
