import type { ReportParams } from "@color-bank-hub/contracts/report";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { getReports } from "../api/reports.api";

export const reportQueries = {
  all: ["reports"] as const,
  list: (params: ReportParams) =>
    queryOptions({
      queryKey: ["reports", "list", params],
      queryFn: ({ signal }) => getReports(params, signal),
    }),
};

export const useReportTotal = (params: ReportParams, enabled = true) =>
  useQuery({
    ...reportQueries.list({ ...params, pageSize: 1 }),
    select: (page) => page.pagination.total,
    enabled,
  });
