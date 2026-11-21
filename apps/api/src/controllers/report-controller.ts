// Reports: data issues, shade corrections and system bugs. Used by: Report page, Home "{n} pending" badge.
//
// Method Path              Handler       Permission      Input (contracts)    DB
// GET    /api/reports      listReports   (auth)          report.listReportsRequest   read  reports
// GET    /api/reports/:id  findReport    (auth)          uuid                 read  reports, audit_logs (status history in `events`)
// POST   /api/reports      createReport  report:create   report.createReportRequest   write reports
// PATCH  /api/reports/:id  updateReport  (auth, see below)  report.updateReportRequest  write reports, audit_logs
//
// Visibility (service): can(role, "report:resolve") (Admin, R&D) sees all reports; others only their own.
// Someone else's id -> NOT_FOUND REPORT_NOT_FOUND. Home pending count: ?status=pending&pageSize=1, read pagination.total.
// Rules on create (service):
// - wrong_color_mapping, incorrect_shade_data need a shade (REPORT_SHADE_REQUIRED); missing_sku needs a product (REPORT_PRODUCT_REQUIRED); other needs nothing.
// - brand, product and shade must agree (BRAND_SHADE_MISMATCH, PRODUCT_SHADE_MISMATCH, BRAND_PRODUCT_MISMATCH); the product and brand are filled from the shade.
// - attachmentKeys (max 5): upload purpose report-attachment (images or pdf), checked with verifyUpload; responses carry signed links.
// Status moves (PATCH { status, note? }; service checks who may do it, a visible report is always yours or you are a resolver):
// - pending -> resolved: resolver, note optional.  pending -> rejected: resolver, note required (NOTE_REQUIRED).
// - resolved -> closed (Confirm): reporter only.  resolved -> pending (Reopen): reporter (note required) or resolver.
// - rejected -> pending: resolver.  Anything else -> CONFLICT INVALID_TRANSITION; not allowed for you -> FORBIDDEN.
// Review window: REPORT_REVIEW_DAYS (default 3) after resolve. Then the report closes by itself (autoClosed, audit row without actor).
// That runs lazily at the start of list, find and update, so a resolved report is always inside the window. No cron job.
// Responses carry reviewDeadline (only while resolved) for the countdown.

import { uuid } from "@color-bank-hub/contracts/common";
import { createReportRequest, listReportsRequest, updateReportRequest } from "@color-bank-hub/contracts/report";
import type { Context } from "hono";
import { parse } from "#api/core/errors.js";
import type { AppEnv } from "#api/middleware/auth.js";
import * as reports from "#api/services/report-service.js";

type Ctx = Context<AppEnv>;

export async function listReports(c: Ctx) {
  const query = parse(listReportsRequest, c.req.query());
  return c.json({ data: await reports.listReports(query, c.get("user")) });
}

export async function findReport(c: Ctx) {
  const id = parse(uuid, c.req.param("id"));
  return c.json({ data: await reports.findReportDetail(id, c.get("user")) });
}

export async function createReport(c: Ctx) {
  const input = parse(createReportRequest, await c.req.json());
  const report = await reports.createReport(input, c.get("user"));
  return c.json({ data: report }, 201);
}

export async function updateReport(c: Ctx) {
  const id = parse(uuid, c.req.param("id"));
  const input = parse(updateReportRequest, await c.req.json());
  const report = await reports.updateReport(id, input, c.get("user"));
  return c.json({ data: report });
}
