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
  uuid,
} from "./common.js";

export const shadeInput = z
  .object({
    productId: uuid,
    sku: name.optional(),
    name,
    hex,
    ingredientsInci: z.string().trim().max(20000).optional(),
    mayContain: z.string().max(20000).optional(),
    lipPhotoKey: z.string().max(500).optional(),
    swatchPhotoKey: z.string().max(500).optional(),
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
  productId: uuid.optional(),
  productFormatItemId: z.coerce.number().int().positive().optional(),
  undertone: undertone.optional(),
  season: season.optional(),
  colorFamily: name.optional(),
  hueMunsell: name.optional(),
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
  sku: string | null;
  name: string;
  hex: string;
  undertone: Undertone | null;
  season: Season | null;
  hueMunsell: string | null;
  colorFamily: string | null;
  valueClass: string | null;
  chromaClass: string | null;
  hslH: number | null;
  hslS: number | null;
  hslL: number | null;
  lipPhotoKey: string | null;
  swatchPhotoKey: string | null;
  /** Signed URLs for display, null without a photo. */
  lipPhotoUrl: string | null;
  swatchPhotoUrl: string | null;
  ingredientsInci: string | null;
  mayContain: string | null;
  /** Only returned for own-brand shades. */
  composition?: CompositionItem[] | null;
}
/** Another shade linked as a benchmark. */
export interface ShadeRef {
  id: string;
  name: string;
  product: string;
  brand: string;
}
export interface Shade extends StoredShade {
  product: Product;
  brand: Brand;
  formatItem: FormatItem;
  /** Detail only (GET /shades/:id). External shades this one is benchmarked to. */
  benchmarkedTo?: ShadeRef[];
  /** Detail only. Own shades that use this one as their benchmark. */
  benchmarkFor?: ShadeRef[];
}
