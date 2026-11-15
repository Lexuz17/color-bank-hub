// Classification configs: cut-offs per category (undertone, season, Hue Munsell, family, value, chroma).
// Used by: Data Input auto preview (needs the active config), future admin settings page.
//
// Method Path                                        Handler        Permission             Input (contracts)                       DB
// GET    /api/classification-configs?productFormatId  listVersions   classification:manage  query productFormatId                   read  classification_config_versions
// GET    /api/classification-configs/active?productFormatItemId
//                                                    findActive     (auth)                 query productFormatItemId                read  classification_config_versions + product_format_items
// POST   /api/classification-configs                 createVersion  classification:manage  configInput                             write classification_config_versions (version = max + 1, active), shades, audit_logs
// PATCH  /api/classification-configs/:id/activate    activate       classification:manage  uuid                                    write classification_config_versions (swap is_active), shades, audit_logs
//
// Decided: shades always use the active version. Saving a version makes it active at once; activating a version
// re-classifies every shade of that category (classifyColor on each hex, update labels) in the same transaction as the is_active swap.
// Mappings on Default read the active version live. Old versions stay as history; rollback = activate an old version.
// audit_logs row per activation (actor, before/after version).
// Per-mapping custom cut-offs live in mappings.classificationConfig, never in this table.
// Rules (service): never edit an old version; category exists -> NOT_FOUND; undertone and season labels must be enum values;
// the last color family rule matches everything; every sub rule names an existing family.
// Open: preview of how many shades change label before saving.

import { activeConfigQuery, configInput, configListQuery } from "@color-bank-hub/contracts/color-classification";
import { uuid } from "@color-bank-hub/contracts/common";
import type { Context } from "hono";
import { parse } from "#api/core/errors.js";
import type { AppEnv } from "#api/middleware/auth.js";
import * as configs from "#api/services/classification-config-service.js";

type Ctx = Context<AppEnv>;

export async function findActive(c: Ctx) {
  const { productFormatItemId } = parse(activeConfigQuery, c.req.query());
  return c.json({ data: await configs.findActive(productFormatItemId) });
}

export async function listVersions(c: Ctx) {
  const { productFormatId } = parse(configListQuery, c.req.query());
  return c.json({ data: await configs.listVersions(productFormatId) });
}

export async function createVersion(c: Ctx) {
  const input = parse(configInput, await c.req.json());
  return c.json({ data: await configs.createVersion(input, c.get("user").id) }, 201);
}

export async function activate(c: Ctx) {
  const id = parse(uuid, c.req.param("id"));
  return c.json({ data: await configs.activate(id, c.get("user").id) });
}
