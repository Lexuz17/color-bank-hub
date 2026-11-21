import type { ListReportsParams, ReportListResponse } from "@color-bank-hub/contracts/report";
import { get } from "@/lib/http";

export function getReports(params: ListReportsParams, signal?: AbortSignal) {
  return get<ReportListResponse>("/reports", params, signal);
}
