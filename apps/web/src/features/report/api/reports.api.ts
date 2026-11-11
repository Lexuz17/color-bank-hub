import type { Page } from "@color-bank-hub/contracts/common";
import type { Report, ReportParams } from "@color-bank-hub/contracts/report";
import { get } from "@/services/http";

export function getReports(params: ReportParams, signal?: AbortSignal) {
  return get<Page<Report>>("/reports", params, signal);
}
