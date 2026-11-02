import {
  type ApiIssue,
  type ErrorCode,
  errorStatus,
} from "@color-bank-hub/contracts/common";
import type { z } from "zod";

export class AppError extends Error {
  constructor(
    readonly code: ErrorCode,
    message: string,
    readonly reason?: string,
    readonly issues?: ApiIssue[],
  ) {
    super(message);
  }
  get status() {
    return errorStatus[this.code];
  }
}

export function fail(code: ErrorCode, message: string, reason?: string): never {
  throw new AppError(code, message, reason);
}

export function parse<T extends z.ZodType>(
  schema: T,
  value: unknown,
): z.output<T> {
  const result = schema.safeParse(value);
  if (!result.success)
    throw new AppError(
      "VALIDATION_ERROR",
      "Request validation failed",
      undefined,
      result.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    );
  return result.data;
}
