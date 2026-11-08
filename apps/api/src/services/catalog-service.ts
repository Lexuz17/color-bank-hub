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
import { getFileUrl, verifyUpload } from "#api/services/upload-service.js";

/** Field-level RBAC: strip composition for roles that may not see it. */
function visibleShade<T extends { composition?: unknown }>(
  shade: T,
  role: Role,
) {
  if (can(role, "shade:viewComposition")) return shade;
  const { composition: _composition, ...rest } = shade;
  return rest;
}

type PhotoKeys = { lipPhotoKey: string | null; swatchPhotoKey: string | null };

/** Shades store object keys; clients get signed URLs. */
async function withPhotoUrls<T extends PhotoKeys>(shade: T) {
  return {
    ...shade,
    lipPhotoUrl: await getFileUrl(shade.lipPhotoKey),
    swatchPhotoUrl: await getFileUrl(shade.swatchPhotoKey),
  };
}

async function verifyPhotos(input: Partial<ShadeInput>) {
  for (const key of [input.lipPhotoKey, input.swatchPhotoKey])
    if (key) await verifyUpload(key, "shade-photo");
}

export const listBrands = () => repository.listBrands();
export const createBrand = (input: BrandInput) => repository.createBrand(input);

export const listFormats = () => repository.listFormats();
export const createFormat = (input: FormatInput) =>
  repository.createFormat(input);

export const listProducts = () => repository.listProducts();
export const createProduct = (input: ProductInput) =>
  repository.createProduct(input);

export async function listShades(query: ShadeQuery) {
  const page = await repository.listShades(query);
  return { ...page, items: await Promise.all(page.items.map(withPhotoUrls)) };
}

export async function findShade(id: string, role: Role) {
  return withPhotoUrls(visibleShade(await repository.findShade(id), role));
}

export async function createShade(input: ShadeInput, role: Role) {
  await verifyPhotos(input);
  const [shade] = await repository.createShades([input]);
  return withPhotoUrls(visibleShade(shade, role));
}

export async function updateShade(id: string, input: ShadePatch, role: Role) {
  await verifyPhotos(input);
  return withPhotoUrls(
    visibleShade(await repository.updateShade(id, input), role),
  );
}
