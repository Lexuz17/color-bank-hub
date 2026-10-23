// packages/contracts/src/common.ts
import { z } from "zod";

export const paginationSchema = z.object({
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1),
  total: z.number().int().min(0),
});
export type Pagination = z.infer<typeof paginationSchema>;

export const apiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.string(), z.unknown()).optional(),
});
export type ApiError = z.infer<typeof apiErrorSchema>;

export const apiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    meta: z.record(z.string(), z.unknown()).optional(),
  });
export type ApiResponse<T> = {
  data: T;
  meta?: Record<string, unknown>;
};

export const paginatedResponseSchema = <T extends z.ZodType>(itemSchema: T) =>
  apiResponseSchema(
    z.object({
      items: z.array(itemSchema),
      pagination: paginationSchema,
    }),
  );
export type PaginatedResponse<T> = ApiResponse<{
  items: T[];
  pagination: Pagination;
}>;
