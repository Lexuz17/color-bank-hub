import { z } from "zod";

export const uuid = z.uuid();
export const name = z.string().trim().min(1).max(255);
export const hex = z
  .string()
  .regex(/^#[\da-fA-F]{6}$/, "Use a six-digit HEX code")
  .transform((value) => value.toLowerCase());
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
export type CompositionItem = z.infer<typeof composition>[number];

export const season = z.enum([
  "spring",
  "summer",
  "autumn",
  "winter",
  "neutral",
]);
export type Season = z.infer<typeof season>;
export const undertone = z.enum(["warm", "neutral", "cool"]);
export type Undertone = z.infer<typeof undertone>;
export const priority = z.enum(["low", "medium", "high"]);
export type Priority = z.infer<typeof priority>;

export const pagination = z.object({
  page: z.coerce.number().int().min(1).max(100000).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

/** Every successful API response wraps its payload in `data`. */
export interface ApiResponse<T> {
  data: T;
}
export interface Page<T> {
  items: T[];
  pagination: { page: number; pageSize: number; total: number };
}
export interface ApiIssue {
  path: string;
  message: string;
}
/** General error codes, one HTTP status each. `reason` carries the specific cause. */
export const errorStatus = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  PAYLOAD_TOO_LARGE: 413,
  VALIDATION_ERROR: 422,
  BUSINESS_RULE: 422,
  INTERNAL: 500,
} as const;
export type ErrorCode = keyof typeof errorStatus;
export interface ApiErrorBody {
  error: {
    code: ErrorCode;
    /** Specific cause, e.g. SHADE_NOT_FOUND. Stable; safe to branch on. */
    reason?: string;
    message: string;
    /** Matches the server log line and the X-Request-Id response header. */
    requestId?: string;
    /** Present only for VALIDATION_ERROR. */
    issues?: ApiIssue[];
  };
}
