import { asc, count, desc, eq } from "drizzle-orm";
import type {
  ReportInput,
  ReportQuery,
} from "@color-bank-hub/contracts/report";
import { auditLogs, reports, shades } from "@color-bank-hub/db";
import { fail } from "#api/core/errors.js";
import { db } from "#api/lib/db.js";

export async function listReports(query: ReportQuery) {
  const where = query.status ? eq(reports.status, query.status) : undefined;
  const [items, total] = await Promise.all([
    db
      .select()
      .from(reports)
      .where(where)
      .orderBy(desc(reports.createdAt), asc(reports.id))
      .limit(query.pageSize)
      .offset((query.page - 1) * query.pageSize),
    db.select({ count: count() }).from(reports).where(where),
  ]);
  return {
    items,
    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      total: total[0].count,
    },
  };
}
export async function findReport(id: string) {
  const [row] = await db.select().from(reports).where(eq(reports.id, id));
  if (!row) fail("NOT_FOUND", "Report not found", "REPORT_NOT_FOUND");
  return row;
}
export async function createReport(input: ReportInput, reporterId: string) {
  if (input.shadeId && input.brandId) {
    const shade = await db.query.shades.findFirst({
      where: eq(shades.id, input.shadeId),
      with: { product: true },
    });
    if (!shade || shade.product.brandId !== input.brandId)
      fail(
        "BUSINESS_RULE",
        "Shade does not belong to this brand",
        "BRAND_SHADE_MISMATCH",
      );
  }
  const [row] = await db
    .insert(reports)
    .values({ ...input, reporterId })
    .returning();
  return row;
}
export async function updateReportStatus(
  id: string,
  status: "pending" | "resolved",
  actorId: string,
) {
  return db.transaction(async (tx) => {
    const [current] = await tx
      .select()
      .from(reports)
      .where(eq(reports.id, id))
      .for("update");
    if (!current) fail("NOT_FOUND", "Report not found", "REPORT_NOT_FOUND");
    const [row] = await tx
      .update(reports)
      .set({
        status,
        resolvedBy: status === "resolved" ? actorId : null,
        resolvedAt: status === "resolved" ? new Date() : null,
      })
      .where(eq(reports.id, id))
      .returning();
    await tx.insert(auditLogs).values({
      actorId,
      action: "report.status.changed",
      targetType: "report",
      targetId: id,
      before: { status: current.status },
      after: { status },
    });
    return row;
  });
}
