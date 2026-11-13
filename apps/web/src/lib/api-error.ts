import type { ApiErrorBody } from "@color-bank-hub/contracts/common";
import { isAxiosError } from "axios";

export function apiError(error: unknown): string {
  if (isAxiosError<ApiErrorBody>(error)) {
    const details = error.response?.data?.error;
    if (details?.issues?.length)
      return details.issues
        .map(
          (issue) => `${issue.path ? `${issue.path}: ` : ""}${issue.message}`,
        )
        .join("; ");
    if (details?.message) return details.message;
    if (!error.response)
      return "Cannot reach the server. Check your connection and try again.";
    if (error.response.status >= 500)
      return "Server error. Please try again or contact admin.";
  }
  return error instanceof Error
    ? error.message
    : "Unable to complete the request.";
}
