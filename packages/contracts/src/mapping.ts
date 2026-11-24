import { z } from "zod";
import { type Page, name, pagination, splitList, uuid } from "./common.js";
import type { Shade } from "./shade.js";

export const mappingView = z.enum(["season", "color_family", "hue_circle", "custom"]);
export type MappingView = z.infer<typeof mappingView>;

export const mappingInput = z
  .object({
    name,
    notes: z.string().trim().min(1).max(300),
    productFormatItemId: z.number().int().positive(),
    shadeIds: z.array(uuid).min(1),
    viewMode: mappingView,
    /** Axis keys of the custom view (e.g. "lchC"). Ignored for the other views. */
    axisX: z.string().max(20).optional(),
    axisY: z.string().max(20).optional(),
    showPhoto: z.boolean(),
    hideProductName: z.boolean(),
  })
  .strict();
export type MappingInput = z.infer<typeof mappingInput>;

export interface Mapping {
  id: string;
  name: string;
  createdAt: string;
}

export const mappingFolderInput = z.object({ name }).strict();
export type MappingFolderInput = z.infer<typeof mappingFolderInput>;

export const mappingFolderMove = z.object({ folderId: uuid.nullable() }).strict();

export const mappingQuery = pagination.extend({
  library: z.enum(["all", "mine"]).default("all"),
  folderId: uuid.optional(),
  brandIds: z.preprocess(splitList, z.array(uuid).max(100)).optional(),
  productFormatItemIds: z.preprocess(splitList, z.array(z.coerce.number().int().positive()).max(100)).optional(),
  search: z.string().trim().max(255).optional(),
});
export type MappingQuery = z.infer<typeof mappingQuery>;
export type MappingParams = z.input<typeof mappingQuery>;

export interface MappingCard {
  kind: "system" | "mine";
  /** system: `${productId}:${productFormatItemId}`, mine: the mapping id */
  id: string;
  name: string;
  notes: string | null;
  shadeCount: number;
  swatches: string[];
  updatedAt: string;
  folderId: string | null;
}

export interface MappingCounts {
  all: number;
  mine: number;
  folders: { id: string; name: string; count: number }[];
  brands: Record<string, number>;
  formats: Record<string, number>;
}

export interface MappingList extends Page<MappingCard> {
  counts: MappingCounts;
}

export interface MappingDetail {
  id: string;
  name: string;
  notes: string | null;
  productFormatItemId: number;
  viewMode: MappingView;
  axisX: string | null;
  axisY: string | null;
  showPhoto: boolean;
  hideProductName: boolean;
  shades: Shade[];
}
