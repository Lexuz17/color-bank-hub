import { z } from "zod";
import { type Page, type Priority, pagination, priority, uuid } from "./common.js";

export const reportStatus = z.enum(["pending", "resolved", "closed", "rejected"]);
export type ReportStatus = z.infer<typeof reportStatus>;

export const reportIssueType = z.enum(["wrong_color_mapping", "incorrect_shade_data", "missing_sku", "other"]);
export type ReportIssueType = z.infer<typeof reportIssueType>;

export const reportIssueLabels: Record<ReportIssueType, string> = {
  wrong_color_mapping: "Wrong color mapping",
  incorrect_shade_data: "Incorrect shade data",
  missing_sku: "Missing SKU",
  other: "Other / System bug",
};

export const createReportRequest = z
  .object({
    issueType: reportIssueType,
    brandId: uuid.optional(),
    productId: uuid.optional(),
    shadeId: uuid.optional(),
    description: z.string().trim().min(10, "Describe the issue in at least 10 characters").max(20000),
    attachmentKeys: z.array(z.string().min(1).max(255)).max(5).optional(),
    priority: priority.default("medium"),
  })
  .strict();
export type CreateReportRequest = z.infer<typeof createReportRequest>;

export const listReportsRequest = pagination.extend({
  status: reportStatus.optional(),
});
export type ListReportsRequest = z.infer<typeof listReportsRequest>;
/** What the client sends: page and pageSize may be left out. */
export type ListReportsParams = z.input<typeof listReportsRequest>;

export const updateReportRequest = z.object({ status: reportStatus, note: z.string().trim().min(1).max(1000).optional() }).strict();
export type UpdateReportRequest = z.infer<typeof updateReportRequest>;

export interface ReportResponse {
  id: string;
  issueType: ReportIssueType;
  description: string;
  priority: Priority;
  status: ReportStatus;
  createdAt: string;
  resolvedAt: string | null;
  /** Resolver note on resolve, or the reason on reject. */
  resolutionNote: string | null;
  /** Reporter note on confirm or reopen. */
  feedbackNote: string | null;
  closedAt: string | null;
  autoClosed: boolean;
  /** Only while resolved: when the report closes by itself. */
  reviewDeadline: string | null;
  reporter: { id: string; name: string };
  brand: { id: string; name: string } | null;
  product: { id: string; name: string } | null;
  shade: { id: string; name: string; sku: string | null; hex: string } | null;
  attachments: { key: string; url: string }[];
}

export interface ReportEvent {
  id: number;
  from: ReportStatus | null;
  to: ReportStatus;
  note: string | null;
  autoClosed: boolean;
  /** null when the system did it (automatic close). */
  actor: { id: string; name: string } | null;
  createdAt: string;
}

export interface ReportDetailResponse extends ReportResponse {
  events: ReportEvent[];
}

export type ReportListResponse = Page<ReportResponse>;
