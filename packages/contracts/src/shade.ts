import { z } from "zod";
import type { Brand, FormatItem, Product } from "./catalog.js";
import {
  type CompositionItem,
  type Season,
  type Undertone,
  composition,
  hex,
  name,
  pagination,
  season,
  undertone,
  url,
  uuid,
} from "./common.js";

export const shadeInput = z
  .object({
    productId: uuid,
    sku: name,
    name,
    hex,
    mayContain: z.string().max(20000).optional(),
    lipPhotoUrl: url.optional(),
    swatchPhotoUrl: url.optional(),
    composition: composition.optional(),
  })
  .strict();
export type ShadeInput = z.infer<typeof shadeInput>;

export const shadePatch = shadeInput
  .omit({ productId: true })
  .partial()
  .refine(
    (value) => Object.keys(value).length > 0,
    "Provide at least one field",
  );
export type ShadePatch = z.infer<typeof shadePatch>;

export const shadeSort = z.enum([
  "name",
  "sku",
  "createdAt",
  "hue",
  "lightness",
]);
export type ShadeSort = z.infer<typeof shadeSort>;

export const shadeQuery = pagination.extend({
  search: z.string().trim().max(255).optional(),
  brandId: uuid.optional(),
  formatItemId: z.coerce.number().int().positive().optional(),
  undertone: undertone.optional(),
  season: season.optional(),
  colorFamily: name.optional(),
  sort: shadeSort.default("name"),
  direction: z.enum(["asc", "desc"]).default("asc"),
});
/** Parsed query on the server (defaults applied). */
export type ShadeQuery = z.infer<typeof shadeQuery>;
/** Query params a client may send (everything optional). */
export type ShadeParams = z.input<typeof shadeQuery>;

export interface StoredShade {
  id: string;
  productId: string;
  sku: string;
  name: string;
  hex: string;
  undertone: Undertone | null;
  season: Season | null;
  colorFamily: string | null;
  valueClass: string | null;
  chromaClass: string | null;
  hslH: number | null;
  hslS: number | null;
  hslL: number | null;
  lipPhotoUrl: string | null;
  swatchPhotoUrl: string | null;
  mayContain: string | null;
  /** Only returned for own-brand shades. */
  composition?: CompositionItem[] | null;
}
export interface Shade extends StoredShade {
  product: Product;
  brand: Brand;
  formatItem: FormatItem;
}
