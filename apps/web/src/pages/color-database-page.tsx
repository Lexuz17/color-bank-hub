import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { PageShell } from "@/components/layout/page-shell";
import {
  PageToolbar,
  ShadeSwatch,
  StatusBadge,
} from "@/components/shared/workspace-components";
import { ProductDetailPanel } from "@/components/shared/product-detail-panel";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { tableRows, sampleProfile } from "@/lib/data/demo-shades";
export function ColorDatabasePage() {
  const [format, setFormat] = useState("Lip Tint Gloss");
  const [selected, setSelected] = useState(tableRows[4]);
  const columns: ColumnDef<(typeof tableRows)[number]>[] = [
    { accessorKey: "brand", header: "Brand" },
    { accessorKey: "product", header: "Product name" },
    {
      accessorKey: "shade",
      header: "Shade name",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          className="h-auto justify-start px-0"
          onClick={() => setSelected(row.original)}
        >
          <ShadeSwatch hex={row.original.hex} />
          {row.original.shade}
        </Button>
      ),
    },
    {
      accessorKey: "undertone",
      header: "Undertone",
      cell: ({ row }) => <StatusBadge status={row.original.undertone} />,
    },
    {
      accessorKey: "season",
      header: "Season",
      cell: ({ row }) => <StatusBadge status={row.original.season} />,
    },
    { accessorKey: "hex", header: "HEX" },
  ];
  return (
    <PageShell
      section="Color Database"
      format={format}
      onFormatChange={setFormat}
    >
      <PageToolbar
        title={`Color Database · ${format}`}
        description={`Benchmarks allowed: ${format} only`}
      />
      <div className="p-5">
        <DataTable
          columns={columns}
          data={format === "Lip Tint Gloss" ? tableRows : []}
          searchColumn="shade"
          searchPlaceholder="Search shades…"
          pageSize={12}
        />
        <p className="mt-3 text-[11px] text-muted-foreground">
          Demo records are available under Lip Tint Gloss. Select a shade to
          inspect its profile.
        </p>
      </div>
    </PageShell>
  );
}
