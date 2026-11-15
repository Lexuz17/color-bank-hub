import type { ConfigInput } from "@color-bank-hub/contracts/color-classification";
import { auditLogs, classificationConfigVersions, productFormatItems, productFormats } from "@color-bank-hub/db";
import { and, desc, eq, max } from "drizzle-orm";
import { db, type Executor } from "#api/lib/db.js";

const versionColumns = {
  id: classificationConfigVersions.id,
  version: classificationConfigVersions.version,
  isActive: classificationConfigVersions.isActive,
  note: classificationConfigVersions.note,
  createdAt: classificationConfigVersions.createdAt,
  config: classificationConfigVersions.config,
};

export async function findActiveConfig(productFormatItemId: number) {
  const [row] = await db
    .select({ config: classificationConfigVersions.config })
    .from(classificationConfigVersions)
    .innerJoin(productFormatItems, eq(productFormatItems.productFormatId, classificationConfigVersions.productFormatId))
    .where(and(eq(productFormatItems.id, productFormatItemId), eq(classificationConfigVersions.isActive, true)));
  return row;
}

export async function findFormat(productFormatId: number) {
  const [row] = await db.select({ id: productFormats.id }).from(productFormats).where(eq(productFormats.id, productFormatId));
  return row;
}

export function listVersions(productFormatId: number) {
  return db
    .select(versionColumns)
    .from(classificationConfigVersions)
    .where(eq(classificationConfigVersions.productFormatId, productFormatId))
    .orderBy(desc(classificationConfigVersions.version));
}

export async function findVersion(id: string) {
  const [row] = await db
    .select({ ...versionColumns, productFormatId: classificationConfigVersions.productFormatId })
    .from(classificationConfigVersions)
    .where(eq(classificationConfigVersions.id, id));
  return row;
}

// Turns off the active version of the category and returns its number
async function deactivate(tx: Executor, productFormatId: number) {
  const [previous] = await tx
    .update(classificationConfigVersions)
    .set({ isActive: false })
    .where(and(eq(classificationConfigVersions.productFormatId, productFormatId), eq(classificationConfigVersions.isActive, true)))
    .returning({ version: classificationConfigVersions.version });
  return previous?.version ?? null;
}

const audit = (tx: Executor, actorId: string, id: string, before: number | null, after: number) =>
  tx.insert(auditLogs).values({
    actorId,
    action: "classification_config.activated",
    targetType: "classification_config",
    targetId: id,
    before: { version: before },
    after: { version: after },
  });

export async function createActiveVersion(tx: Executor, input: ConfigInput, actorId: string) {
  const [last] = await tx
    .select({ version: max(classificationConfigVersions.version) })
    .from(classificationConfigVersions)
    .where(eq(classificationConfigVersions.productFormatId, input.productFormatId));
  const before = await deactivate(tx, input.productFormatId);
  const [row] = await tx
    .insert(classificationConfigVersions)
    .values({ ...input, version: (last?.version ?? 0) + 1, isActive: true, createdBy: actorId })
    .returning(versionColumns);
  await audit(tx, actorId, row.id, before, row.version);
  return row;
}

export async function activateVersion(tx: Executor, version: { id: string; productFormatId: number; version: number }, actorId: string) {
  const before = await deactivate(tx, version.productFormatId);
  const [row] = await tx
    .update(classificationConfigVersions)
    .set({ isActive: true })
    .where(eq(classificationConfigVersions.id, version.id))
    .returning(versionColumns);
  await audit(tx, actorId, version.id, before, version.version);
  return row;
}
