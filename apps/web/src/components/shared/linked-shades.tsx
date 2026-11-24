import type { ShadeRef } from "@color-bank-hub/contracts/shade";
import { useState } from "react";

const collapsedCount = 2;

export function LinkedShades({ shades }: { shades: ShadeRef[] }) {
  const [expanded, setExpanded] = useState(false);
  if (shades.length === 0) return <span className="text-muted-foreground">—</span>;
  const hiddenCount = shades.length - collapsedCount;
  return (
    <div className="space-y-0.5">
      {(expanded ? shades : shades.slice(0, collapsedCount)).map((shade) => (
        <p key={shade.id}>
          {shade.name} ·{" "}
          <span className="text-muted-foreground">
            {shade.brand} {shade.product}
          </span>
        </p>
      ))}
      {hiddenCount > 0 && (
        <button type="button" className="text-[11px] text-primary hover:underline" onClick={() => setExpanded(!expanded)}>
          {expanded ? "Hide" : `Show all (+${hiddenCount})`}
        </button>
      )}
    </div>
  );
}
