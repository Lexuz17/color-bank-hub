import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { brands } from "./brands";
import { priorityLevel, reportStatus } from "./enums";
import { shades } from "./shades";
import { users } from "./users";

export const reports = pgTable(
  "reports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reporterId: uuid("reporter_id")
      .notNull()
      .references(() => users.id),
    brandId: uuid("brand_id").references(() => brands.id),
    shadeId: uuid("shade_id").references(() => shades.id),
    description: text("description").notNull(),
    /** images or pdf, can be more than 1 */
    attachmentUrls: text("attachment_urls").array(),
    priority: priorityLevel("priority").notNull().default("medium"),
    status: reportStatus("status").notNull().default("pending"),
    resolvedBy: uuid("resolved_by").references(() => users.id, {
      onDelete: "set null",
    }),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("reports_status_idx").on(t.status),
    index("reports_created_at_idx").on(t.createdAt),
  ],
);

export type Report = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;
