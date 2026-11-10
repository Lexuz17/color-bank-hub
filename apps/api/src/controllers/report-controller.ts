// Reports (data issues / shade corrections). Used by: Report page, Home "{n} pending" badge.
// Status: built in workflow-controller.ts, move the code here.
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

export {};
