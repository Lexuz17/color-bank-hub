import { get, patch, post } from "@/services/http";
import type { Page, Report, ReportInput } from "@/types/api";

export const reportsApi = {
  reports: (
    params: { page: number; pageSize: number; status?: Report["status"] },
    signal?: AbortSignal,
  ) => get<Page<Report>>("/reports", params, signal),
  createReport: (body: ReportInput) => post<Report>("/reports", body),
  updateReport: (id: string, status: Report["status"]) =>
    patch<Report>(`/reports/${id}`, { status }),
};
