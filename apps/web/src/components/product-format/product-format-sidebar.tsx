import { useState } from "react";
import {
  ChevronDown,
  Droplets,
  Paintbrush,
  Sparkles,
  Pipette,
  Info,
  Cylinder,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const groups = [
  {
    section: "LIP PRODUCT FORMATS",
    name: "Lip Cream",
    base: "Anhydrous",
    count: "2,397",
    icon: Paintbrush,
    children: [
      ["Lip Velvet", "743"],
      ["Lip Matte", "1,308"],
      ["Lip Vinyl", "346"],
    ],
  },
  {
    name: "Lip Tint",
    base: "Emulsion",
    count: "3,496",
    icon: Droplets,
    children: [
      ["Lip Tint Gloss", "2,244"],
      ["Lip Tint Velvet", "923"],
      ["Water Lip Tint", "329"],
    ],
  },
  {
    name: "Lip Stick",
    base: "Semisolid",
    count: "2,303",
    icon: Cylinder,
    children: [
      ["Matte Lipstick", "1,332"],
      ["Gloss Lipstick", "723"],
      ["Balm", "248"],
    ],
  },
  {
    name: "Lip Oil",
    base: "Oil-based",
    count: "290",
    icon: Pipette,
    children: [["Lip Oil / Lip Gloss", "290"]],
  },
  {
    section: "BLUSH FORMATS",
    name: "Blush",
    count: "300",
    icon: Paintbrush,
    children: [
      ["Powder Blush", "200"],
      ["Liquid Blush", "100"],
    ],
  },
  {
    section: "EYESHADOW FORMATS",
    name: "Eyeshadow",
    count: "100",
    icon: Sparkles,
    children: [
      ["Shimmer", "30"],
      ["Matte", "70"],
    ],
  },
];

export function ProductFormatSidebar({
  value,
  onValueChange,
  footer,
}: {
  value: string;
  onValueChange: (value: string) => void;
  footer?: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState<string[]>([]);
  return (
    <div className="flex h-full flex-col bg-card text-[11px]">
      <nav
        aria-label="Product formats"
        className="min-h-0 flex-1 overflow-y-auto py-3"
      >
        {groups.map((group) => (
          <div key={group.name}>
            {group.section && (
              <h2 className="px-4 pt-2 pb-2 text-[10px] font-medium tracking-wide text-muted-foreground">
                {group.section}
              </h2>
            )}
            <button
              type="button"
              className="flex w-full items-center gap-1.5 px-3 py-2 text-left hover:bg-muted"
              aria-expanded={!collapsed.includes(group.name)}
              onClick={() =>
                setCollapsed((prev) =>
                  prev.includes(group.name)
                    ? prev.filter((name) => name !== group.name)
                    : [...prev, group.name],
                )
              }
            >
              <ChevronDown
                className={cn(
                  "size-3 text-muted-foreground transition-transform",
                  collapsed.includes(group.name) && "-rotate-90",
                )}
              />
              <group.icon className="size-3.5 text-primary" />
              <span className="font-medium">{group.name}</span>
              {group.base && (
                <span className="ml-auto rounded-sm bg-muted px-1 text-[8px] text-muted-foreground">
                  {group.base}
                </span>
              )}
              <span className="ml-auto text-[9px] tabular-nums text-muted-foreground">
                {group.count}
              </span>
            </button>
            {!collapsed.includes(group.name) &&
              group.children.map(([name, count]) => (
                <button
                  type="button"
                  key={name}
                  aria-current={value === name ? "true" : undefined}
                  onClick={() => onValueChange(name)}
                  className="flex w-full items-center gap-2 border-l-2 border-transparent py-2 pr-3 pl-8 text-left text-muted-foreground hover:bg-muted aria-[current=true]:border-primary aria-[current=true]:bg-accent aria-[current=true]:text-primary"
                >
                  <span
                    aria-hidden="true"
                    className="size-1 rounded-sm bg-chart-2"
                  />
                  <span>{name}</span>
                  <span className="ml-auto text-[9px] tabular-nums">
                    {count}
                  </span>
                </button>
              ))}
          </div>
        ))}
      </nav>
      <div className="mx-3 mb-3 rounded-md border bg-muted/60 p-2.5 text-[10px] leading-relaxed text-muted-foreground">
        <Info className="mr-1 inline size-3" />
        <strong className="font-medium">Benchmark rule:</strong> benchmarks must
        share a compatible parent format and finish.
      </div>
      {footer && <div className="border-t bg-accent p-3">{footer}</div>}
    </div>
  );
}
