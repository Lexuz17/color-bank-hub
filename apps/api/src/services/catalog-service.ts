import type {
  BrandInput,
  FormatInput,
  ProductInput,
} from "@color-bank-hub/contracts/catalog";
import { can, type Role } from "@color-bank-hub/contracts/rbac";
import type {
  ShadeInput,
  ShadePatch,
  ShadeQuery,
} from "@color-bank-hub/contracts/shade";
import * as repository from "#api/repositories/catalog-repository.js";

/** Field-level RBAC: strip composition for roles that may not see it. */
function visibleShade<T extends { composition?: unknown }>(
  shade: T,
  role: Role,
) {
  if (can(role, "shade:viewComposition")) return shade;
  const { composition: _composition, ...rest } = shade;
  return rest;
}

export const listBrands = () => repository.listBrands();
export const createBrand = (input: BrandInput) => repository.createBrand(input);

export const listFormats = () => repository.listFormats();
export const createFormat = (input: FormatInput) =>
  repository.createFormat(input);

export const listProducts = () => repository.listProducts();
export const createProduct = (input: ProductInput) =>
  repository.createProduct(input);

export const listShades = (query: ShadeQuery) => repository.listShades(query);

export async function findShade(id: string, role: Role) {
  return visibleShade(await repository.findShade(id), role);
}

export async function createShade(input: ShadeInput, role: Role) {
  const [shade] = await repository.createShades([input]);
  return visibleShade(shade, role);
}

export async function updateShade(id: string, input: ShadePatch, role: Role) {
  return visibleShade(await repository.updateShade(id, input), role);
}
