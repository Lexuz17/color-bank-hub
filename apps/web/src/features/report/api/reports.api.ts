import type {
  Report,
  ReportInput,
  ReportStatus,
} from "@color-bank-hub/contracts/report";
import { patch, post } from "@/lib/http";

export function createReport(body: ReportInput) {
  return post<Report>("/reports", body);
}

export function updateReport(id: string, status: ReportStatus) {
  return patch<Report>(`/reports/${id}`, { status });
}
