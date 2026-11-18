import { brands, mappingFolders, mappings, type NewMapping, productFormatItems, products, shades } from "@color-bank-hub/db";
import { and, asc, count, eq, inArray, max, sql } from "drizzle-orm";
import { db } from "#api/lib/db.js";

const saved = { id: mappings.id, name: mappings.name, createdAt: mappings.createdAt };

export async function createMapping(values: NewMapping) {
  const [row] = await db.insert(mappings).values(values).returning(saved);
  return row;
}

export async function updateMapping(id: string, values: Partial<NewMapping>) {
  const [row] = await db.update(mappings).set(values).where(eq(mappings.id, id)).returning(saved);
  return row;
}

export const deleteMapping = (id: string) => db.delete(mappings).where(eq(mappings.id, id));

export const setFolder = (id: string, folderId: string | null) => db.update(mappings).set({ folderId }).where(eq(mappings.id, id));

export async function findOwnedMapping(id: string, ownerId: string) {
  const [row] = await db
    .select({
      id: mappings.id,
      name: mappings.name,
      notes: mappings.notes,
      productFormatItemId: mappings.productFormatItemId,
      shadeIds: mappings.shadeIds,
      viewMode: mappings.viewMode,
      axisX: mappings.axisX,
      axisY: mappings.axisY,
      showPhoto: mappings.showPhoto,
      hideProductName: mappings.hideProductName,
    })
    .from(mappings)
    .where(and(eq(mappings.id, id), eq(mappings.ownerId, ownerId)));
  return row;
}

export const listMappingsByOwner = (ownerId: string) =>
  db
    .select({
      id: mappings.id,
      name: mappings.name,
      notes: mappings.notes,
      folderId: mappings.folderId,
      productFormatItemId: mappings.productFormatItemId,
      shadeIds: mappings.shadeIds,
      updatedAt: mappings.updatedAt,
    })
    .from(mappings)
    .where(eq(mappings.ownerId, ownerId));

export const listShadeGroups = () =>
  db
    .select({
      brandId: brands.id,
      brandName: brands.name,
      formatItemId: productFormatItems.id,
      formatItemName: productFormatItems.name,
      shadeCount: count(),
      updatedAt: max(shades.updatedAt),
      swatches: sql<string[]>`(array_agg(${shades.hex} order by ${shades.name}))[1:7]`,
    })
    .from(shades)
    .innerJoin(products, eq(products.id, shades.productId))
    .innerJoin(brands, eq(brands.id, products.brandId))
    .innerJoin(productFormatItems, eq(productFormatItems.id, products.productFormatItemId))
    .where(eq(brands.isOwn, true))
    .groupBy(brands.id, brands.name, productFormatItems.id, productFormatItems.name);

export const listShadeSummaries = (ids: string[]) =>
  db
    .select({ id: shades.id, hex: shades.hex, name: shades.name, sku: shades.sku, brandId: brands.id, brandName: brands.name })
    .from(shades)
    .innerJoin(products, eq(products.id, shades.productId))
    .innerJoin(brands, eq(brands.id, products.brandId))
    .where(inArray(shades.id, ids));

export const listFolders = (ownerId: string) =>
  db
    .select({ id: mappingFolders.id, name: mappingFolders.name })
    .from(mappingFolders)
    .where(eq(mappingFolders.ownerId, ownerId))
    .orderBy(asc(mappingFolders.name));

export async function findOwnedFolder(id: string, ownerId: string) {
  const [row] = await db
    .select({ id: mappingFolders.id })
    .from(mappingFolders)
    .where(and(eq(mappingFolders.id, id), eq(mappingFolders.ownerId, ownerId)));
  return row;
}

export async function findMappingByName(ownerId: string, name: string) {
  const [row] = await db
    .select({ id: mappings.id })
    .from(mappings)
    .where(and(eq(mappings.ownerId, ownerId), sql`lower(${mappings.name}) = lower(${name})`));
  return row;
}

export async function findFolderByName(ownerId: string, name: string) {
  const [row] = await db
    .select({ id: mappingFolders.id })
    .from(mappingFolders)
    .where(and(eq(mappingFolders.ownerId, ownerId), sql`lower(${mappingFolders.name}) = lower(${name})`));
  return row;
}

export async function createFolder(ownerId: string, name: string) {
  const [row] = await db.insert(mappingFolders).values({ ownerId, name }).returning({ id: mappingFolders.id, name: mappingFolders.name });
  return row;
}

export async function renameFolder(id: string, name: string) {
  const [row] = await db
    .update(mappingFolders)
    .set({ name })
    .where(eq(mappingFolders.id, id))
    .returning({ id: mappingFolders.id, name: mappingFolders.name });
  return row;
}

export const deleteFolder = (id: string) => db.delete(mappingFolders).where(eq(mappingFolders.id, id));
