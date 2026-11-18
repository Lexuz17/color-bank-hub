import type { MappingCard, MappingDetail, MappingInput, MappingList, MappingQuery } from "@color-bank-hub/contracts/mapping";
import { fail } from "#api/core/errors.js";
import * as repository from "#api/repositories/mapping-repository.js";
import { findActive } from "#api/services/classification-config-service.js";
import { countShadesInFormatItem, listShadesByIds } from "#api/services/shade-service.js";

async function checkedShadeIds(input: MappingInput) {
  const shadeIds = [...new Set(input.shadeIds)];
  if ((await countShadesInFormatItem(shadeIds, input.productFormatItemId)) !== shadeIds.length)
    fail("BUSINESS_RULE", "Every shade must exist and belong to the selected format", "MAPPING_FORMAT_MISMATCH");
  return shadeIds;
}

async function ownedMapping(id: string, userId: string) {
  const mapping = await repository.findOwnedMapping(id, userId);
  if (!mapping) fail("NOT_FOUND", "Mapping not found", "MAPPING_NOT_FOUND");
  return mapping;
}

async function ownedFolder(id: string, userId: string) {
  const folder = await repository.findOwnedFolder(id, userId);
  if (!folder) fail("NOT_FOUND", "Folder not found", "FOLDER_NOT_FOUND");
}

async function checkMappingName(name: string, userId: string, ownId?: string) {
  const same = await repository.findMappingByName(userId, name);
  if (same && same.id !== ownId) fail("CONFLICT", "You already have a mapping with this name", "MAPPING_NAME_TAKEN");
}

async function checkFolderName(name: string, userId: string, ownId?: string) {
  const same = await repository.findFolderByName(userId, name);
  if (same && same.id !== ownId) fail("CONFLICT", "A folder with this name already exists", "FOLDER_NAME_TAKEN");
}

export async function createMapping(input: MappingInput, ownerId: string) {
  await checkMappingName(input.name, ownerId);
  const custom = input.viewMode === "custom";
  return repository.createMapping({
    ownerId,
    name: input.name,
    notes: input.notes,
    productFormatItemId: input.productFormatItemId,
    shadeIds: await checkedShadeIds(input),
    viewMode: input.viewMode,
    axisX: custom ? input.axisX : null,
    axisY: custom ? input.axisY : null,
    showPhoto: input.showPhoto,
    hideProductName: input.hideProductName,
    classificationConfig: await findActive(input.productFormatItemId),
    useActiveConfig: false,
  });
}

export async function updateMapping(id: string, input: MappingInput, userId: string) {
  await ownedMapping(id, userId);
  await checkMappingName(input.name, userId, id);
  const custom = input.viewMode === "custom";
  return repository.updateMapping(id, {
    name: input.name,
    notes: input.notes,
    productFormatItemId: input.productFormatItemId,
    shadeIds: await checkedShadeIds(input),
    viewMode: input.viewMode,
    axisX: custom ? input.axisX : null,
    axisY: custom ? input.axisY : null,
    showPhoto: input.showPhoto,
    hideProductName: input.hideProductName,
  });
}

export async function findMapping(id: string, userId: string): Promise<MappingDetail> {
  const { shadeIds, ...mapping } = await ownedMapping(id, userId);
  const shades = await listShadesByIds(shadeIds);
  return { ...mapping, shades: shadeIds.flatMap((shadeId) => shades.find((shade) => shade.id === shadeId) ?? []) };
}

export async function deleteMapping(id: string, userId: string) {
  await ownedMapping(id, userId);
  await repository.deleteMapping(id);
}

export async function moveToFolder(id: string, folderId: string | null, userId: string) {
  await ownedMapping(id, userId);
  if (folderId) await ownedFolder(folderId, userId);
  await repository.setFolder(id, folderId);
}

export async function createFolder(name: string, userId: string) {
  await checkFolderName(name, userId);
  return repository.createFolder(userId, name);
}

export async function renameFolder(id: string, name: string, userId: string) {
  await ownedFolder(id, userId);
  await checkFolderName(name, userId, id);
  return repository.renameFolder(id, name);
}

export async function deleteFolder(id: string, userId: string) {
  await ownedFolder(id, userId);
  await repository.deleteFolder(id);
}

type Entry = { card: MappingCard; brandIds: string[]; formatItemId: number; text: string };

export async function listMappings(query: MappingQuery, userId: string): Promise<MappingList> {
  const [shadeGroups, ownMappings, folders] = await Promise.all([
    repository.listShadeGroups(),
    repository.listMappingsByOwner(userId),
    repository.listFolders(userId),
  ]);
  const shadeIds = [...new Set(ownMappings.flatMap((mapping) => mapping.shadeIds))];
  const shadeSummaries = shadeIds.length ? await repository.listShadeSummaries(shadeIds) : [];

  const systemEntries: Entry[] = shadeGroups.map((group) => ({
    card: {
      kind: "system",
      id: `${group.brandId}:${group.formatItemId}`,
      name: `${group.brandName} - ${group.formatItemName}`,
      notes: null,
      shadeCount: group.shadeCount,
      swatches: group.swatches,
      updatedAt: (group.updatedAt ?? new Date(0)).toISOString(),
      folderId: null,
    },
    brandIds: [group.brandId],
    formatItemId: group.formatItemId,
    text: `${group.brandName} - ${group.formatItemName}`,
  }));

  const mineEntries: Entry[] = ownMappings.map((mapping) => {
    const mappingShades = shadeSummaries.filter((shade) => mapping.shadeIds.includes(shade.id));
    return {
      card: {
        kind: "mine",
        id: mapping.id,
        name: mapping.name,
        notes: mapping.notes,
        shadeCount: mapping.shadeIds.length,
        swatches: mappingShades.slice(0, 7).map((shade) => shade.hex),
        updatedAt: mapping.updatedAt.toISOString(),
        folderId: mapping.folderId,
      },
      brandIds: [...new Set(mappingShades.map((shade) => shade.brandId))],
      formatItemId: mapping.productFormatItemId,
      text: [mapping.name, mapping.notes, ...mappingShades.flatMap((shade) => [shade.name, shade.sku, shade.brandName])].join(" "),
    };
  });

  const allEntries = [...systemEntries, ...mineEntries];
  const search = query.search?.toLowerCase();
  const matches = allEntries
    .filter(({ card, brandIds, formatItemId, text }) => {
      if (query.folderId ? card.folderId !== query.folderId : query.library === "mine" && card.kind !== "mine") return false;
      if (query.brandIds && !query.brandIds.some((brandId) => brandIds.includes(brandId))) return false;
      if (query.productFormatItemIds && !query.productFormatItemIds.includes(formatItemId)) return false;
      return !search || text.toLowerCase().includes(search);
    })
    .sort((a, b) => b.card.updatedAt.localeCompare(a.card.updatedAt) || a.card.name.localeCompare(b.card.name));

  const counts = { brands: {} as Record<string, number>, formats: {} as Record<string, number> };
  for (const { brandIds, formatItemId } of allEntries) {
    for (const brandId of brandIds) counts.brands[brandId] = (counts.brands[brandId] ?? 0) + 1;
    counts.formats[formatItemId] = (counts.formats[formatItemId] ?? 0) + 1;
  }

  return {
    items: matches.slice((query.page - 1) * query.pageSize, query.page * query.pageSize).map((entry) => entry.card),
    pagination: { page: query.page, pageSize: query.pageSize, total: matches.length },
    counts: {
      all: allEntries.length,
      mine: mineEntries.length,
      folders: folders.map((folder) => ({ ...folder, count: mineEntries.filter((entry) => entry.card.folderId === folder.id).length })),
      ...counts,
    },
  };
}
