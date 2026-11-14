import { z } from "zod";
import { name, uuid } from "./common.js";

export const brandInput = z.object({ name, isOwn: z.boolean().default(false) }).strict();
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
    productFormatItemId: z.number().int().positive(),
    name,
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
  productFormatId: number;
  name: string;
  code: string;
  baseType: string | null;
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
  productFormatItemId: number;
  name: string;
}
