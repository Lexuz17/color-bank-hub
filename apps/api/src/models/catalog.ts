import { z } from "zod";
export const uuid = z.uuid();
export const hex = z
  .string()
  .regex(/^#[\da-fA-F]{6}$/, "Use a six-digit HEX code")
  .transform((value) => value.toLowerCase());
const name = z.string().trim().min(1).max(255);
export const url = z
  .url()
  .refine(
    (value) => ["https:", "http:"].includes(new URL(value).protocol),
    "Use an HTTP or HTTPS URL",
  );
export const composition = z
  .array(z.object({ name, percentage: z.number().min(0).max(100) }).strict())
  .max(100)
  .refine(
    (items) =>
      items.reduce((total, item) => total + item.percentage, 0) <= 100.000001,
    "Composition cannot exceed 100%",
  );
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
export const shadePatch = shadeInput
  .omit({ productId: true })
  .partial()
  .refine(
    (value) => Object.keys(value).length > 0,
    "Provide at least one field",
  );
export const brandInput = z
  .object({ name, isOwn: z.boolean().default(false) })
  .strict();
export const productInput = z
  .object({
    brandId: uuid,
    formatItemId: z.number().int().positive(),
    name,
    baseType: name.optional(),
    ingredientsInci: z.string().trim().min(1).max(20000),
  })
  .strict();
export const pagination = z.object({
  page: z.coerce.number().int().min(1).max(100000).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});
export const shadeQuery = pagination.extend({
  search: z.string().trim().max(255).optional(),
  brandId: uuid.optional(),
  formatItemId: z.coerce.number().int().positive().optional(),
  undertone: z.enum(["warm", "neutral", "cool"]).optional(),
  season: z.enum(["spring", "summer", "autumn", "winter"]).optional(),
  colorFamily: name.optional(),
  sort: z
    .enum(["name", "sku", "createdAt", "hue", "lightness"])
    .default("name"),
  direction: z.enum(["asc", "desc"]).default("asc"),
});
export const importInput = z
  .object({ rows: z.array(z.unknown()).min(1).max(500) })
  .strict();
export type ShadeInput = z.infer<typeof shadeInput>;
export type ShadeQuery = z.infer<typeof shadeQuery>;

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
