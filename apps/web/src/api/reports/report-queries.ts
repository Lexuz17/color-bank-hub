import type { ReportParams } from "@color-bank-hub/contracts/report";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getReports } from "./reports.api";

export const useReports = (params: ReportParams) =>
  useQuery({
    queryKey: ["reports", "list", params],
    queryFn: ({ signal }) => getReports(params, signal),
    placeholderData: keepPreviousData,
  });

export const useReportTotal = (params: ReportParams, enabled = true) => {
  const query = { ...params, pageSize: 1 };
  return useQuery({
    queryKey: ["reports", "list", query],
    queryFn: ({ signal }) => getReports(query, signal),
    select: (page) => page.pagination.total,
    enabled,
  });
};
