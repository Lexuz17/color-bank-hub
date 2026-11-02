import { z } from "zod";
import {
  type CompositionItem,
  type Priority,
  type Season,
  composition,
  hex,
  name,
  pagination,
  priority,
  season,
  url,
} from "./common.js";

export const prototypeType = z.enum(["benchmark_matching", "gap_filling"]);
export type PrototypeType = z.infer<typeof prototypeType>;
export const prototypeStatus = z.enum([
  "pending",
  "approved",
  "formulating",
  "completed",
  "declined",
]);
export type PrototypeStatus = z.infer<typeof prototypeStatus>;

export const prototypeInput = z
  .object({
    type: prototypeType,
    priority: priority.default("medium"),
    description: z.string().max(20000).optional(),
    brandNameNew: name,
    productNameNew: name,
    shadeNameNew: name,
    targetHex: hex,
    formatItemId: z.number().int().positive(),
    targetSeason: season.optional(),
  })
  .strict();
export type PrototypeInput = z.infer<typeof prototypeInput>;

export const prototypeQuery = pagination.extend({
  status: prototypeStatus.optional(),
  formatItemId: z.coerce.number().int().positive().optional(),
});
export type PrototypeQuery = z.infer<typeof prototypeQuery>;
export type PrototypeParams = z.input<typeof prototypeQuery>;

export const transitionInput = z
  .object({
    status: prototypeStatus.exclude(["pending"]),
    declineReason: z.string().trim().min(1).max(2000).optional(),
  })
  .strict()
  .refine((value) => value.status !== "declined" || !!value.declineReason, {
    message: "A decline reason is required",
    path: ["declineReason"],
  });
export type TransitionInput = z.infer<typeof transitionInput>;

export const formulationInput = z
  .object({
    baseType: name.optional(),
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
export type FormulationInput = z.infer<typeof formulationInput>;

export interface PrototypeRequest {
  id: string;
  type: PrototypeType;
  priority: Priority;
  description: string | null;
  brandNameNew: string | null;
  productNameNew: string | null;
  shadeNameNew: string | null;
  targetHex: string | null;
  formatItemId: number;
  targetSeason: Season | null;
  autoName: string | null;
  status: PrototypeStatus;
  declineReason: string | null;
  ingredientsInci: string | null;
  composition: CompositionItem[] | null;
  resultPhotoUrl: string | null;
  resultNotes: string | null;
  createdAt: string;
}
