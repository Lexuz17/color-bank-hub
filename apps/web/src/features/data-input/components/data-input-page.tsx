import { CheckIcon, DatabaseIcon, FileSpreadsheetIcon, PenLineIcon } from "lucide-react";
import { useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { PageToolbar } from "@/components/shared/workspace-components";
import { ShadeDatabase } from "@/components/shades/shade-database";
import { ManualForm } from "./manual-form";
import { UploadPanel } from "./upload-panel";

const methods = [
  {
    id: "upload",
    icon: FileSpreadsheetIcon,
    label: "File Upload",
    title: "File Upload",
    description: "Upload the filled .xlsx template. Nothing is saved until every row is valid.",
  },
  {
    id: "manual",
    icon: PenLineIcon,
    label: "Manual Entry",
    title: "Manual Entry",
    description: "Enter one shade at a time. Only the HEX code is needed for all color fields.",
  },
  {
    id: "manage",
    icon: DatabaseIcon,
    label: "Manage Database",
    title: "Manage Database",
    description: "Browse and edit the shades in the database.",
  },
] as const;

const autoCalculated = [
  "RGB from HEX",
  "HSL + HSB",
  "CIE Lab + LCh",
  "Tone (Warm/Cool/Neutral)",
  "Season classification",
  "Color family",
  "Hue, value and chroma",
];

export function DataInputPage() {
  const [method, setMethod] = useState<(typeof methods)[number]["id"]>("upload");
  const current = methods.find((item) => item.id === method) ?? methods[0];

  // Same look as ProductFormatSidebar: 11px text, small headings, items with a left accent when active.
  const sidebar = (
    <div className="h-full bg-card py-2 text-[11px]">
      <h2 className="px-4 pt-2 pb-2 text-[10px] font-medium tracking-wide text-muted-foreground">INPUT METHOD</h2>
      <nav aria-label="Input method">
        {methods.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-current={item.id === method ? "true" : undefined}
            className="flex w-full items-center gap-2 border-l-2 border-transparent px-4 py-2 text-left text-muted-foreground hover:bg-muted aria-[current=true]:border-primary aria-[current=true]:bg-accent aria-[current=true]:text-primary"
            onClick={() => setMethod(item.id)}
          >
            <item.icon className="size-3.5" />
            {item.label}
          </button>
        ))}
      </nav>
      <h2 className="px-4 pt-6 pb-2 text-[10px] font-medium tracking-wide text-muted-foreground">AUTO-CALCULATED</h2>
      <ul className="grid gap-2 px-4">
        {autoCalculated.map((item) => (
          <li key={item} className="flex items-center gap-2 text-success-foreground">
            <CheckIcon className="size-3" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <PageShell section="Data Input" sidebar={sidebar}>
      <PageToolbar title={current.title} description={current.description} />
      {method === "upload" && (
        <div className="p-5">
          <UploadPanel />
        </div>
      )}
      {method === "manual" && <ManualForm />}
      {method === "manage" && (
        <div className="p-5">
          <ShadeDatabase editable />
        </div>
      )}
    </PageShell>
  );
}
