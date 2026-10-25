import { and, asc, desc, eq, count, sql } from "drizzle-orm";
import {
  db,
  reports,
  prototypeRequests,
  productFormatItems,
  auditLogs,
  shades,
} from "@color-bank-hub/db";
import type { z } from "zod";
import type {
  reportInput,
  reportQuery,
  requestInput,
  requestQuery,
  transitionInput,
  formulationInput,
} from "#api/models/workflows.js";
import { fail } from "#api/core/errors.js";
import { developmentActorId } from "#api/repositories/development-actor-repository.js";

export async function listReports(query: z.infer<typeof reportQuery>) {
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
  if (!row) fail(404, "REPORT_NOT_FOUND", "Report not found");
  return row;
}
export async function createReport(input: z.infer<typeof reportInput>) {
  if (input.shadeId && input.brandId) {
    const shade = await db.query.shades.findFirst({
      where: eq(shades.id, input.shadeId),
      with: { product: true },
    });
    if (!shade || shade.product.brandId !== input.brandId)
      fail(422, "BRAND_SHADE_MISMATCH", "Shade does not belong to this brand");
  }
  const reporterId = await developmentActorId();
  const [row] = await db
    .insert(reports)
    .values({ ...input, reporterId })
    .returning();
  return row;
}
export async function updateReportStatus(
  id: string,
  status: "pending" | "resolved",
) {
  const actorId = await developmentActorId();
  return db.transaction(async (tx) => {
    const [current] = await tx
      .select()
      .from(reports)
      .where(eq(reports.id, id))
      .for("update");
    if (!current) fail(404, "REPORT_NOT_FOUND", "Report not found");
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
export async function listRequests(query: z.infer<typeof requestQuery>) {
  const where = and(
    query.status ? eq(prototypeRequests.status, query.status) : undefined,
    query.formatItemId
      ? eq(prototypeRequests.formatItemId, query.formatItemId)
      : undefined,
  );
  const [items, total] = await Promise.all([
    db
      .select()
      .from(prototypeRequests)
      .where(where)
      .orderBy(desc(prototypeRequests.createdAt), asc(prototypeRequests.id))
      .limit(query.pageSize)
      .offset((query.page - 1) * query.pageSize),
    db.select({ count: count() }).from(prototypeRequests).where(where),
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
export async function findRequest(id: string) {
  const [row] = await db
    .select()
    .from(prototypeRequests)
    .where(eq(prototypeRequests.id, id));
  if (!row) fail(404, "REQUEST_NOT_FOUND", "Prototype request not found");
  return row;
}
export async function createRequest(input: z.infer<typeof requestInput>) {
  const requesterId = await developmentActorId();
  const [row] = await db
    .insert(prototypeRequests)
    .values({ ...input, requesterId })
    .returning();
  return row;
}
export async function transitionRequest(
  id: string,
  input: z.infer<typeof transitionInput>,
) {
  const actorId = await developmentActorId();
  return db.transaction(async (tx) => {
    const [current] = await tx
      .select()
      .from(prototypeRequests)
      .where(eq(prototypeRequests.id, id))
      .for("update");
    if (!current) fail(404, "REQUEST_NOT_FOUND", "Prototype request not found");
    const allowed: Record<string, string[]> = {
      pending: ["approved", "declined"],
      approved: ["formulating"],
      formulating: ["completed"],
      completed: [],
      declined: [],
    };
    if (!allowed[current.status].includes(input.status))
      fail(
        409,
        "INVALID_TRANSITION",
        `Cannot move from ${current.status} to ${input.status}`,
      );
    if (input.status === "completed" && !current.resultPhotoUrl)
      fail(
        422,
        "RESULT_REQUIRED",
        "Upload a result photo URL before marking the result uploaded",
      );
    let naming: {} | { sequenceNo: number; autoName: string } = {};
    if (input.status === "approved") {
      await tx.execute(
        sql`select pg_advisory_xact_lock(1847, ${current.formatItemId})`,
      );
      const [format] = await tx
        .select()
        .from(productFormatItems)
        .where(eq(productFormatItems.id, current.formatItemId));
      const [sequence] = await tx
        .select({
          next: sql<number>`coalesce(max(${prototypeRequests.sequenceNo}), 0)::int + 1`,
        })
        .from(prototypeRequests)
        .where(eq(prototypeRequests.formatItemId, current.formatItemId));
      naming = {
        sequenceNo: sequence.next,
        autoName: `${format.code}-${String(sequence.next).padStart(4, "0")}`,
      };
    }
    const [row] = await tx
      .update(prototypeRequests)
      .set({
        ...naming,
        status: input.status,
        ...(["approved", "declined"].includes(input.status)
          ? { decidedBy: actorId, decidedAt: new Date() }
          : {}),
        declineReason: input.status === "declined" ? input.declineReason : null,
      })
      .where(eq(prototypeRequests.id, id))
      .returning();
    await tx.insert(auditLogs).values({
      actorId,
      action: "prototype.status.changed",
      targetType: "prototype_request",
      targetId: id,
      before: { status: current.status },
      after: { status: input.status },
    });
    return row;
  });
}
export async function updateFormulation(
  id: string,
  input: z.infer<typeof formulationInput>,
) {
  return db.transaction(async (tx) => {
    const [current] = await tx
      .select()
      .from(prototypeRequests)
      .where(eq(prototypeRequests.id, id))
      .for("update");
    if (!current) fail(404, "REQUEST_NOT_FOUND", "Prototype request not found");
    if (current.status !== "formulating")
      fail(
        409,
        "NOT_FORMULATING",
        "Formulation can only be edited while formulating",
      );
    const [row] = await tx
      .update(prototypeRequests)
      .set(input)
      .where(eq(prototypeRequests.id, id))
      .returning();
    return row;
  });
}
