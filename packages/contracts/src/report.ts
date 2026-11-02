import { z } from "zod";
import { type Priority, pagination, priority, url, uuid } from "./common.js";

export const reportStatus = z.enum(["pending", "resolved"]);
export type ReportStatus = z.infer<typeof reportStatus>;

export const reportInput = z
  .object({
    brandId: uuid.optional(),
    shadeId: uuid.optional(),
    description: z.string().trim().min(10).max(20000),
    attachmentUrls: z.array(url).max(10).optional(),
    priority: priority.default("medium"),
  })
  .strict();
export type ReportInput = z.infer<typeof reportInput>;

export const reportQuery = pagination.extend({
  status: reportStatus.optional(),
});
export type ReportQuery = z.infer<typeof reportQuery>;
export type ReportParams = z.input<typeof reportQuery>;

export const reportPatch = z.object({ status: reportStatus }).strict();

export interface Report {
  id: string;
  brandId: string | null;
  shadeId: string | null;
  description: string;
  priority: Priority;
  status: ReportStatus;
  createdAt: string;
  resolvedAt: string | null;
  attachmentUrls: string[] | null;
}
