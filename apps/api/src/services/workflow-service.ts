import { parse } from "#api/core/errors.js";
import { uuid } from "#api/models/catalog.js";
import {
  reportInput,
  reportQuery,
  reportPatch,
  requestInput,
  requestQuery,
  transitionInput,
  formulationInput,
} from "#api/models/workflows.js";
import * as repository from "#api/repositories/workflow-repository.js";
export const listReports = (query: unknown) =>
  repository.listReports(parse(reportQuery, query));
export const findReport = (id: unknown) =>
  repository.findReport(parse(uuid, id));
export const createReport = (input: unknown) =>
  repository.createReport(parse(reportInput, input));
export const updateReport = (id: unknown, input: unknown) =>
  repository.updateReportStatus(
    parse(uuid, id),
    parse(reportPatch, input).status,
  );
export const listRequests = (query: unknown) =>
  repository.listRequests(parse(requestQuery, query));
export const findRequest = (id: unknown) =>
  repository.findRequest(parse(uuid, id));
export const createRequest = (input: unknown) =>
  repository.createRequest(parse(requestInput, input));
export const transition = (id: unknown, input: unknown) =>
  repository.transitionRequest(parse(uuid, id), parse(transitionInput, input));
export const formulation = (id: unknown, input: unknown) =>
  repository.updateFormulation(parse(uuid, id), parse(formulationInput, input));
