import type {
  FormulationInput,
  PrototypeInput,
  PrototypeQuery,
  TransitionInput,
} from "@color-bank-hub/contracts/prototype";
import type {
  ReportInput,
  ReportQuery,
  ReportStatus,
} from "@color-bank-hub/contracts/report";
import * as repository from "#api/repositories/workflow-repository.js";

export const listReports = (query: ReportQuery) =>
  repository.listReports(query);
export const findReport = (id: string) => repository.findReport(id);
export const createReport = (input: ReportInput, actorId: string) =>
  repository.createReport(input, actorId);
export const updateReport = (
  id: string,
  status: ReportStatus,
  actorId: string,
) => repository.updateReportStatus(id, status, actorId);

export const listRequests = (query: PrototypeQuery) =>
  repository.listRequests(query);
export const findRequest = (id: string) => repository.findRequest(id);
export const createRequest = (input: PrototypeInput, actorId: string) =>
  repository.createRequest(input, actorId);
export const transition = (
  id: string,
  input: TransitionInput,
  actorId: string,
) => repository.transitionRequest(id, input, actorId);
export const updateFormulation = (id: string, input: FormulationInput) =>
  repository.updateFormulation(id, input);
