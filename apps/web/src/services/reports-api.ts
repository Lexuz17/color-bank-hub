import type { Page } from "@color-bank-hub/contracts/common";
import type {
  Report,
  ReportInput,
  ReportParams,
  ReportStatus,
} from "@color-bank-hub/contracts/report";
import { get, patch, post } from "@/services/http";

export const reportsApi = {
  reports: (params: ReportParams, signal?: AbortSignal) =>
    get<Page<Report>>("/reports", params, signal),
  createReport: (body: ReportInput) => post<Report>("/reports", body),
  updateReport: (id: string, status: ReportStatus) =>
    patch<Report>(`/reports/${id}`, { status }),
};
