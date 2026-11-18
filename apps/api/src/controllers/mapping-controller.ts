// Shade maps. Used by: My Mappings (library, folders, delete), Shade Mapping (open, Save).
// Client decision (2026-11-11, confirmed later):
// - "All mappings" = automatic maps, the same for every account: one per own brand (brands.is_own) + sub-category,
//   e.g. "Emina — Lip Tint Gloss". Not stored: computed from shades on every read, so new products appear automatically.
// - "Mine" = maps a user saved. Private: only the owner can read, edit or delete them (admin too has no access).
// - No draft. A map that is not saved is not stored. No tags on a card; a map has required free text notes (max 300).
// - Folders: one level, named by the user, for "Mine" only. Deleting a folder moves its maps back out (folder_id = null).
// - Pinned is not built (mapping_pins stays unused).
//
// Method Path                     Handler        Input (contracts)                     DB
// GET    /api/mappings            listMappings   mappingQuery: library=all|mine,        all:  read shades + products + brands + product_format_items
//                                                folderId?, brandIds? and productFormatItemIds? ("a,b,c"; any match),
//                                                search?, page                          (group by brand + sub-category -> one card each)
//                                                                                       mine: read mappings where owner_id = user
//                                                -> { items, pagination, counts }
// GET    /api/mappings/:id        findMapping    uuid                                  read  mappings + the shades of shadeIds
// POST   /api/mappings            createMapping  mappingInput (name, notes?, productFormatItemId, shadeIds, viewMode,
//                                                axisX?, axisY?, showPhoto, hideProductName)   write mappings (ownerId = user)
// PATCH  /api/mappings/:id        updateMapping  mappingInput                          write mappings
// DELETE /api/mappings/:id        deleteMapping  uuid                                  write mappings
// PUT    /api/mappings/:id/folder moveToFolder   mappingFolderMove { folderId | null } write mappings.folder_id
// POST   /api/mapping-folders     createFolder   mappingFolderInput { name }           write mapping_folders
// PATCH  /api/mapping-folders/:id renameFolder   mappingFolderInput                    write mapping_folders
// DELETE /api/mapping-folders/:id deleteFolder   uuid                                  write mapping_folders
// All endpoints: any signed-in user (no extra permission); ownership is checked in the service.
//
// Rules (service):
// - Not the owner -> NOT_FOUND MAPPING_NOT_FOUND / FOLDER_NOT_FOUND (do not reveal that a private map or folder exists).
// - All shadeIds exist and belong to productFormatItemId -> BUSINESS_RULE MAPPING_FORMAT_MISMATCH (format is locked).
// - Mapping name is unique per owner (case-insensitive) -> CONFLICT MAPPING_NAME_TAKEN. Notes are required (1-300 characters).
// - Folder name is unique per owner (case-insensitive) -> CONFLICT FOLDER_NAME_TAKEN.
// - POST copies the active config on the server (the client does not send it) and stores useActiveConfig = false.
//   A format without an active config cannot be saved: NOT_FOUND CONFIG_NOT_FOUND. PATCH keeps the stored config.
// - An automatic map has no id in the database. The card opens Shade Mapping with brandId + itemId; editing it and
//   clicking Save creates a new "Mine" map (POST).
// Config (labels on the map are computed when shown, with classifyColor(hex, config), not read from shades):
// - useActiveConfig = false (Custom): classificationConfig, copied from the active config on save.
// - useActiveConfig = true (Default): the active version of the category, read live. Nothing sets it yet.
// Later: thumbnailUrl -> thumbnail key via upload-service (store keys, not URLs). Pin (mapping_pins).

import { uuid } from "@color-bank-hub/contracts/common";
import { mappingFolderInput, mappingFolderMove, mappingInput, mappingQuery } from "@color-bank-hub/contracts/mapping";
import type { Context } from "hono";
import { parse } from "#api/core/errors.js";
import type { AppEnv } from "#api/middleware/auth.js";
import * as mappings from "#api/services/mapping-service.js";

type Ctx = Context<AppEnv>;

export async function listMappings(c: Ctx) {
  return c.json({ data: await mappings.listMappings(parse(mappingQuery, c.req.query()), c.get("user").id) });
}

export async function findMapping(c: Ctx) {
  return c.json({ data: await mappings.findMapping(parse(uuid, c.req.param("id")), c.get("user").id) });
}

export async function createMapping(c: Ctx) {
  const input = parse(mappingInput, await c.req.json());
  return c.json({ data: await mappings.createMapping(input, c.get("user").id) }, 201);
}

export async function updateMapping(c: Ctx) {
  const id = parse(uuid, c.req.param("id"));
  const input = parse(mappingInput, await c.req.json());
  return c.json({ data: await mappings.updateMapping(id, input, c.get("user").id) });
}

export async function deleteMapping(c: Ctx) {
  const id = parse(uuid, c.req.param("id"));
  await mappings.deleteMapping(id, c.get("user").id);
  return c.json({ data: { id } });
}

export async function moveToFolder(c: Ctx) {
  const id = parse(uuid, c.req.param("id"));
  const { folderId } = parse(mappingFolderMove, await c.req.json());
  await mappings.moveToFolder(id, folderId, c.get("user").id);
  return c.json({ data: { id } });
}

export async function createFolder(c: Ctx) {
  const { name } = parse(mappingFolderInput, await c.req.json());
  return c.json({ data: await mappings.createFolder(name, c.get("user").id) }, 201);
}

export async function renameFolder(c: Ctx) {
  const id = parse(uuid, c.req.param("id"));
  const { name } = parse(mappingFolderInput, await c.req.json());
  return c.json({ data: await mappings.renameFolder(id, name, c.get("user").id) });
}

export async function deleteFolder(c: Ctx) {
  const id = parse(uuid, c.req.param("id"));
  await mappings.deleteFolder(id, c.get("user").id);
  return c.json({ data: { id } });
}
