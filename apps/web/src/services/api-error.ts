import { isAxiosError } from "axios";

export function apiError(error: unknown): string {
  if (isAxiosError(error)) {
    const details = error.response?.data?.error;
    if (details?.issues?.length)
      return details.issues
        .map(
          (issue: { path: string; message: string }) =>
            `${issue.path ? `${issue.path}: ` : ""}${issue.message}`,
        )
        .join("; ");
    if (details?.message) return details.message;
    if (!error.response)
      return "Cannot reach the API. Check that the API and database are running.";
    if (error.response.status >= 500)
      return "The API could not load this data. Check its database connection and retry.";
  }
  return error instanceof Error
    ? error.message
    : "Unable to complete the request.";
}
