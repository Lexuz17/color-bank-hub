import { boolean, index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { brands } from "./brands.js";
import { priorityLevel, reportIssueType, reportStatus } from "./enums.js";
import { products } from "./products.js";
import { shades } from "./shades.js";
import { users } from "./users.js";

export const reports = pgTable(
  "reports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reporterId: uuid("reporter_id")
      .notNull()
      .references(() => users.id),
    brandId: uuid("brand_id").references(() => brands.id),
    productId: uuid("product_id").references(() => products.id),
    shadeId: uuid("shade_id").references(() => shades.id),
    issueType: reportIssueType("issue_type").notNull().default("other"),
    description: text("description").notNull(),
    attachmentKeys: text("attachment_keys").array(), // upload keys (report-attachment): images or pdf, up to 5
    priority: priorityLevel("priority").notNull().default("medium"),
    status: reportStatus("status").notNull().default("pending"),
    resolvedBy: uuid("resolved_by").references(() => users.id, {
      onDelete: "set null",
    }),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    resolutionNote: text("resolution_note"), // resolver note on resolve, or the reason on reject
    feedbackNote: text("feedback_note"), // reporter note when confirming or reopening
    closedAt: timestamp("closed_at", { withTimezone: true }),
    autoClosed: boolean("auto_closed").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("reports_status_idx").on(t.status), index("reports_created_at_idx").on(t.createdAt)],
);

export type Report = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;
