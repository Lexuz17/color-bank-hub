import {
  useId,
  useState,
  useEffect,
  type ReactNode,
  type ComponentProps,
} from "react";
import { Search, X, Upload, Map, Check, LoaderCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PageToolbar({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-card px-5 py-3">
      <div>
        <h1 className="text-sm font-medium">{title}</h1>
        {description && (
          <p className="mt-1 text-[11px] text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}
export function SearchInput({
  value,
  onValueChange,
  placeholder = "Search any product, shade, or SKU…",
  className,
}: {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute top-2.5 left-2.5 size-3 text-muted-foreground"
      />
      <Input
        type="search"
        aria-label={placeholder}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        className="pr-8 pl-8 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onValueChange("")}
          className="absolute top-2 right-2 rounded-sm text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
export function ShadeSwatch({
  hex,
  size = "sm",
  className,
  ...props
}: ComponentProps<"span"> & { hex: string; size?: "sm" | "lg" }) {
  const valid = /^#[0-9a-f]{6}$/i.test(hex);
  return (
    <span
      role="img"
      aria-label={valid ? `Shade ${hex}` : "Invalid shade"}
      title={hex}
      className={cn(
        "inline-block shrink-0 rounded-full border border-foreground/10",
        size === "sm" ? "size-5" : "size-12",
        className,
      )}
      style={{ backgroundColor: valid ? hex : "transparent" }}
      {...props}
    />
  );
}
const badgeTypes = {
  Warm: "warm",
  Neutral: "neutral",
  Cool: "cool",
  Spring: "spring",
  Summer: "summer",
  Autumn: "autumn",
  Winter: "winter",
  Pending: "warning",
  Approved: "success",
  Formulating: "info",
  "Result uploaded": "success",
  Closed: "neutral",
  Active: "success",
  "Pending Approval": "warning",
} as const;
export function StatusBadge({ status }: { status: keyof typeof badgeTypes }) {
  return <Badge variant={badgeTypes[status]}>{status}</Badge>;
}
export function EmptyState({
  title = "No shade mapped yet.",
  description = "Select SKUs on the left, then click Generate",
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-2 p-6 text-center">
      <Map className="mb-1 size-7 text-muted-foreground/50" />
      <p className="text-xs font-medium">{title}</p>
      <p className="max-w-64 text-[11px] text-muted-foreground">
        {description}
      </p>
      {action}
    </div>
  );
}
export function LoadingState({
  label = "Loading shades…",
}: {
  label?: string;
}) {
  return (
    <div
      role="status"
      className="flex items-center gap-2 text-xs text-muted-foreground"
    >
      <LoaderCircle className="size-4 animate-spin" />
      {label}
    </div>
  );
}
export function WorkflowSteps({
  steps = ["Pending", "Approved", "Formulating", "Result uploaded"],
  activeStep,
}: {
  steps?: string[];
  activeStep: number;
}) {
  return (
    <ol aria-label="Workflow progress" className="flex flex-wrap gap-1">
      {steps.map((step, index) => (
        <li
          key={step}
          aria-current={index === activeStep ? "step" : undefined}
          className={cn(
            "flex items-center gap-1.5 rounded-sm border px-2 py-1.5 text-[10px]",
            index < activeStep
              ? "border-success-foreground/15 bg-success text-success-foreground"
              : index === activeStep
                ? "border-primary/30 bg-accent text-primary"
                : "text-muted-foreground",
          )}
        >
          <span className="flex size-4 items-center justify-center rounded-full border">
            {index < activeStep ? <Check className="size-2.5" /> : index + 1}
          </span>
          {step}
        </li>
      ))}
    </ol>
  );
}
export function ImageUpload({
  label,
  onFileChange,
}: {
  label: string;
  onFileChange?: (file: File | null) => void;
}) {
  const id = useId();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState("");
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[11px] font-medium">
        {label}
      </label>
      <label
        htmlFor={id}
        className="relative flex min-h-24 cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden rounded-md border border-dashed bg-muted/40 p-3 text-center text-[10px] text-muted-foreground focus-within:ring-2 focus-within:ring-ring/30"
      >
        {preview ? (
          <img
            src={preview}
            alt={label}
            className="h-20 w-full object-contain"
          />
        ) : (
          <>
            <Upload className="size-5" />
            <span>Choose an image</span>
            <span>PNG, JPEG, WebP · up to 5 MB</span>
          </>
        )}
        <input
          id={id}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(event) => {
            const next = event.target.files?.[0] ?? null;
            if (
              next &&
              (!["image/png", "image/jpeg", "image/webp"].includes(next.type) ||
                next.size > 5 * 1024 * 1024)
            ) {
              setError("Choose a PNG, JPEG, or WebP under 5 MB.");
              event.target.value = "";
              return;
            }
            setError("");
            setFile(next);
            setPreview(next ? URL.createObjectURL(next) : "");
            onFileChange?.(next);
          }}
        />
      </label>
      {file && (
        <Button
          variant="ghost"
          size="xs"
          onClick={() => {
            setFile(null);
            setPreview("");
            setError("");
            onFileChange?.(null);
            const input = document.getElementById(
              id,
            ) as HTMLInputElement | null;
            if (input) input.value = "";
          }}
        >
          Remove image
        </Button>
      )}
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1 text-xs text-destructive"
        >
          {error}
        </p>
      )}
    </div>
  );
}
