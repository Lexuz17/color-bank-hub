import { z } from "zod";
import { name, uuid } from "./common.js";

export const brandInput = z
  .object({ name, isOwn: z.boolean().default(false) })
  .strict();
export type BrandInput = z.infer<typeof brandInput>;

export const formatInput = z
  .object({
    name,
    items: z
      .array(
        z
          .object({
            name,
            code: z
              .string()
              .trim()
              .min(1)
              .max(4)
              .regex(/^[A-Za-z0-9]+$/),
          })
          .strict(),
      )
      .min(1)
      .max(30),
  })
  .strict();
export type FormatInput = z.infer<typeof formatInput>;

export const productInput = z
  .object({
    brandId: uuid,
    formatItemId: z.number().int().positive(),
    name,
    baseType: name.optional(),
    ingredientsInci: z.string().trim().min(1).max(20000),
  })
  .strict();
export type ProductInput = z.infer<typeof productInput>;

export interface Brand {
  id: string;
  name: string;
  isOwn: boolean;
}
export interface FormatItem {
  id: number;
  formatId: number;
  name: string;
  code: string;
  count: number;
}
export interface ProductFormat {
  id: number;
  name: string;
  items: FormatItem[];
  count: number;
}
export interface Product {
  id: string;
  brandId: string;
  formatItemId: number;
  name: string;
  baseType: string | null;
  ingredientsInci: string | null;
}
