import { z } from "zod";
import {
  composition,
  hex,
  pagination,
  url,
  uuid,
} from "#api/models/catalog.js";
const text = z.string().trim().min(1).max(255);
export const reportInput = z
  .object({
    brandId: uuid.optional(),
    shadeId: uuid.optional(),
    description: z.string().trim().min(10).max(20000),
    attachmentUrls: z.array(url).max(10).optional(),
    priority: z.enum(["low", "medium", "high"]).default("medium"),
  })
  .strict();
export const reportQuery = pagination.extend({
  status: z.enum(["pending", "resolved"]).optional(),
});
export const reportPatch = z
  .object({ status: z.enum(["pending", "resolved"]) })
  .strict();
export const requestInput = z
  .object({
    type: z.enum(["benchmark_matching", "gap_filling"]),
    priority: z.enum(["low", "medium", "high"]).default("medium"),
    description: z.string().max(20000).optional(),
    brandNameNew: text,
    productNameNew: text,
    shadeNameNew: text,
    targetHex: hex,
    formatItemId: z.number().int().positive(),
    targetSeason: z.enum(["spring", "summer", "autumn", "winter"]).optional(),
  })
  .strict();
export const requestQuery = pagination.extend({
  status: z
    .enum(["pending", "approved", "formulating", "completed", "declined"])
    .optional(),
  formatItemId: z.coerce.number().int().positive().optional(),
});
export const transitionInput = z
  .object({
    status: z.enum(["approved", "declined", "formulating", "completed"]),
    declineReason: z.string().trim().min(1).max(2000).optional(),
  })
  .strict()
  .refine((value) => value.status !== "declined" || !!value.declineReason, {
    message: "A decline reason is required",
    path: ["declineReason"],
  });
export const formulationInput = z
  .object({
    baseType: text.optional(),
    ingredientsInci: z.string().max(20000).optional(),
    mayContain: z.string().max(20000).optional(),
    composition: composition.optional(),
    resultPhotoUrl: url.optional(),
    deltaE: z.number().min(0).max(999).optional(),
    resultNotes: z.string().max(20000).optional(),
  })
  .strict()
  .refine(
    (value) => Object.keys(value).length > 0,
    "Provide at least one field",
  );
