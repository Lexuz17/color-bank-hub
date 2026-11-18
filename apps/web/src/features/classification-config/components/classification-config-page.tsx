import { useState } from "react";
import { useProductFormats } from "@/api/product-formats/product-format-queries";
import { PageShell } from "@/components/layout/page-shell";
import { ApiError } from "@/components/shared/request-feedback";
import { LoadingState, PageToolbar } from "@/components/shared/workspace-components";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useConfigVersions } from "../hooks/config-version-queries";
import { ConfigEditor } from "./config-editor";

export function ClassificationConfigPage() {
  const formats = useProductFormats();
  const [formatId, setFormatId] = useState<number | null>(null);
  const versions = useConfigVersions(formatId);
  const format = formats.data?.find((entry) => entry.id === formatId);
  const activeId = versions.data?.find((version) => version.isActive)?.id;

  return (
    <PageShell section="Classification Rules">
      <PageToolbar
        title="Classification Rules"
        description="Number ranges that decide the season, color family and hue area of every shade. Each product format has its own rules."
      />
      <div className="space-y-5 p-5">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-xs font-medium">1. Product format</p>
          <Select value={formatId === null ? null : String(formatId)} onValueChange={(value) => value && setFormatId(Number(value))}>
            <SelectTrigger className="w-56" aria-label="Product format">
              <SelectValue>{() => format?.name ?? "Product format"}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {formats.data?.map((entry) => (
                <SelectItem key={entry.id} value={String(entry.id)}>
                  {entry.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[11px] text-muted-foreground">The rules below belong to this product format only.</p>
        </div>
        {formatId === null || !format ? (
          <p className="text-xs text-muted-foreground">Pick a product format to see and edit its rules.</p>
        ) : versions.isPending ? (
          <LoadingState label="Loading rules…" />
        ) : versions.isError ? (
          <ApiError error={versions.error} retry={() => void versions.refetch()} />
        ) : (
          <ConfigEditor
            key={`${formatId}-${activeId}`}
            productFormatId={formatId}
            formatName={format.name}
            items={format.items}
            versions={versions.data}
          />
        )}
      </div>
    </PageShell>
  );
}
