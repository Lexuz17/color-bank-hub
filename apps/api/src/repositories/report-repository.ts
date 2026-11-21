import type { ListReportsRequest, ReportStatus } from "@color-bank-hub/contracts/report";
import { auditLogs, brands, products, reports, shades, users } from "@color-bank-hub/db";
import { and, asc, count, desc, eq, getTableColumns, lt, sql } from "drizzle-orm";
import { db } from "#api/lib/db.js";

export async function listReports(query: ListReportsRequest, reporterId?: string) {
  const where = and(query.status ? eq(reports.status, query.status) : undefined, reporterId ? eq(reports.reporterId, reporterId) : undefined);
  const [items, total] = await Promise.all([
    db
      .select({
        report: getTableColumns(reports),
        reporter: { id: users.id, name: users.name },
        brand: { id: brands.id, name: brands.name },
        product: { id: products.id, name: products.name },
        shade: { id: shades.id, name: shades.name, sku: shades.sku, hex: shades.hex },
      })
      .from(reports)
      .innerJoin(users, eq(users.id, reports.reporterId))
      .leftJoin(brands, eq(brands.id, reports.brandId))
      .leftJoin(products, eq(products.id, reports.productId))
      .leftJoin(shades, eq(shades.id, reports.shadeId))
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
  const [row] = await db
    .select({
      report: getTableColumns(reports),
      reporter: { id: users.id, name: users.name },
      brand: { id: brands.id, name: brands.name },
      product: { id: products.id, name: products.name },
      shade: { id: shades.id, name: shades.name, sku: shades.sku, hex: shades.hex },
    })
    .from(reports)
    .innerJoin(users, eq(users.id, reports.reporterId))
    .leftJoin(brands, eq(brands.id, reports.brandId))
    .leftJoin(products, eq(products.id, reports.productId))
    .leftJoin(shades, eq(shades.id, reports.shadeId))
    .where(eq(reports.id, id));
  return row;
}

export async function listReportEvents(id: string) {
  return db
    .select({
      id: auditLogs.id,
      before: auditLogs.before,
      after: auditLogs.after,
      createdAt: auditLogs.createdAt,
      actor: { id: users.id, name: users.name },
    })
    .from(auditLogs)
    .leftJoin(users, eq(users.id, auditLogs.actorId))
    .where(and(eq(auditLogs.targetType, "report"), eq(auditLogs.targetId, id), eq(auditLogs.action, "report.status.changed")))
    .orderBy(asc(auditLogs.createdAt), asc(auditLogs.id));
}

export async function createReport(input: typeof reports.$inferInsert) {
  const [row] = await db.insert(reports).values(input).returning({ id: reports.id });
  return row.id;
}

/** Moves resolved reports past the review window to closed; one audit row each, no actor. */
export async function closeExpiredReports(reviewDays: number) {
  await db.transaction(async (tx) => {
    const closed = await tx
      .update(reports)
      .set({ status: "closed", closedAt: new Date(), autoClosed: true })
      .where(and(eq(reports.status, "resolved"), lt(reports.resolvedAt, sql`now() - make_interval(days => ${reviewDays})`)))
      .returning({ id: reports.id });
    if (closed.length) {
      await tx.insert(auditLogs).values(
        closed.map(({ id }) => ({
          action: "report.status.changed",
          targetType: "report",
          targetId: id,
          before: { status: "resolved" },
          after: { status: "closed", autoClosed: true },
        })),
      );
    }
  });
}

/** Changes the status only while it is still `from`; undefined means it changed in the meantime. */
export async function updateReportStatus(id: string, from: ReportStatus, to: ReportStatus, note: string | undefined, actorId: string) {
  const now = new Date();
  const changes = {
    resolved: { resolvedBy: actorId, resolvedAt: now, resolutionNote: note ?? null },
    rejected: { resolvedBy: actorId, resolvedAt: now, resolutionNote: note ?? null },
    closed: { closedAt: now, feedbackNote: note ?? null },
    pending: { resolvedBy: null, resolvedAt: null, resolutionNote: null, feedbackNote: note ?? null },
  }[to];
  return db.transaction(async (tx) => {
    const [row] = await tx
      .update(reports)
      .set({ status: to, ...changes })
      .where(and(eq(reports.id, id), eq(reports.status, from)))
      .returning({ id: reports.id });
    if (!row) return undefined;
    await tx.insert(auditLogs).values({
      actorId,
      action: "report.status.changed",
      targetType: "report",
      targetId: id,
      before: { status: from },
      after: { status: to, note },
    });
    return row.id;
  });
}
