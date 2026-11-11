import type {
  ReportInput,
  ReportQuery,
  ReportStatus,
} from "@color-bank-hub/contracts/report";
import * as repository from "#api/repositories/report-repository.js";

export const listReports = (query: ReportQuery) => repository.listReports(query);
export const findReport = (id: string) => repository.findReport(id);
export const createReport = (input: ReportInput, actorId: string) => repository.createReport(input, actorId);
export const updateReport = (id: string, status: ReportStatus, actorId: string) => repository.updateReportStatus(id, status, actorId);
