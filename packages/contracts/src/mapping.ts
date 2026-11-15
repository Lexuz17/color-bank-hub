import { z } from "zod";
import { name, uuid } from "./common.js";

export const mappingView = z.enum(["season", "color_family", "hue_circle", "custom"]);
export type MappingView = z.infer<typeof mappingView>;

export const mappingInput = z
  .object({
    name,
    productFormatItemId: z.number().int().positive(),
    shadeIds: z.array(uuid).min(1).max(500),
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
