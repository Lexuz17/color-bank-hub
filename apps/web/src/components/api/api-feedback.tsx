import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { apiError } from "@/services/color-bank-api";
import type { ComponentProps } from "react";
export function ApiError({
  error,
  retry,
}: {
  error: unknown;
  retry?: () => void;
}) {
  return (
    <Alert variant="destructive" role="alert">
      <AlertTitle>Unable to complete the request</AlertTitle>
      <AlertDescription>{apiError(error)}</AlertDescription>
      {retry && (
        <Button
          variant="outline"
          size="xs"
          className="mt-2 w-fit"
          onClick={retry}
        >
          Retry
        </Button>
      )}
    </Alert>
  );
}
export function ResultsPagination({
  page,
  total,
  pageSize,
  onPageChange,
  disabled = false,
}: {
  page: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-3 text-xs text-muted-foreground">
      <span>{total.toLocaleString()} records</span>
      <div className="flex items-center gap-2">
        <span>
          Page {page} of {Math.max(1, Math.ceil(total / pageSize))}
        </span>
        <Button
          variant="outline"
          size="xs"
          disabled={disabled || page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="xs"
          disabled={disabled || page * pageSize >= total}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
export function FieldSelect({ className, ...props }: ComponentProps<"select">) {
  return (
    <select
      className={`h-8 min-w-0 rounded-md border border-input bg-card px-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:opacity-50 ${className ?? ""}`}
      {...props}
    />
  );
}
