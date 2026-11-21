import type { CreateReportRequest, ReportDetailResponse, ReportResponse, UpdateReportRequest } from "@color-bank-hub/contracts/report";
import { get, patch, post } from "@/lib/http";

export function createReport(request: CreateReportRequest) {
  return post<ReportResponse>("/reports", request);
}

export function updateReport(id: string, request: UpdateReportRequest) {
  return patch<ReportResponse>(`/reports/${id}`, request);
}

export function getReport(id: string, signal?: AbortSignal) {
  return get<ReportDetailResponse>(`/reports/${id}`, undefined, signal);
}
