import { z } from "zod";
export function fail(
  status: 400 | 404 | 409 | 422,
  code: string,
  message: string,
): never {
  throw Object.assign(new Error(message), { status, code });
}
export function parse<T extends z.ZodType>(
  schema: T,
  value: unknown,
): z.output<T> {
  const result = schema.safeParse(value);
  if (!result.success)
    throw Object.assign(new Error("Request validation failed"), {
      status: 422,
      code: "VALIDATION_ERROR",
      issues: result.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
  return result.data;
}
