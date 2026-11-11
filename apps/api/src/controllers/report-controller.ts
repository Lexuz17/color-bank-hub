// Reports (data issues / shade corrections). Used by: Report page, Home "{n} pending" badge.
//
// Method Path              Handler       Permission      Input (contracts)    DB
// GET    /api/reports      listReports   (auth)          report.reportQuery   read  reports
// GET    /api/reports/:id  findReport    (auth)          uuid                 read  reports
// POST   /api/reports      createReport  report:create   report.reportInput   write reports
// PATCH  /api/reports/:id  updateReport  report:resolve  report.reportPatch   write reports, audit_logs
//
// Visibility (service, not built yet: today every user gets every report):
// - can(role, "report:resolve") (Website Admin, R&D) -> all reports.
// - Others -> only their own (reporter_id = user). Applies to list and :id; someone else's id -> NOT_FOUND REPORT_NOT_FOUND.
// Home pending count: GET /api/reports?status=pending&pageSize=1 and read pagination.total (same visibility rule).
// Gap vs brief: no "issue type" column (Wrong color mapping, Incorrect shade data, Missing SKU). Add an enum column in packages/db first.
// Later: attachment_urls -> upload keys (purpose in contracts/upload.ts).

import { uuid } from "@color-bank-hub/contracts/common";
import {
  reportInput,
  reportPatch,
  reportQuery,
} from "@color-bank-hub/contracts/report";
import type { Context } from "hono";
import { parse } from "#api/core/errors.js";
import type { AppEnv } from "#api/middleware/auth.js";
import * as reports from "#api/services/report-service.js";

type Ctx = Context<AppEnv>;

export async function listReports(c: Ctx) {
  const query = parse(reportQuery, c.req.query());
  return c.json({ data: await reports.listReports(query) });
}

export async function findReport(c: Ctx) {
  const id = parse(uuid, c.req.param("id"));
  return c.json({ data: await reports.findReport(id) });
}

export async function createReport(c: Ctx) {
  const input = parse(reportInput, await c.req.json());
  const report = await reports.createReport(input, c.get("user").id);
  return c.json({ data: report }, 201);
}

export async function updateReport(c: Ctx) {
  const id = parse(uuid, c.req.param("id"));
  const { status } = parse(reportPatch, await c.req.json());
  const report = await reports.updateReport(id, status, c.get("user").id);
  return c.json({ data: report });
}
