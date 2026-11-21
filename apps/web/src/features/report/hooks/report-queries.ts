import { useQuery } from "@tanstack/react-query";
import { getReport } from "../api/reports.api";

export const useReport = (id: string) =>
  useQuery({
    queryKey: ["reports", "detail", id],
    queryFn: ({ signal }) => getReport(id, signal),
  });
