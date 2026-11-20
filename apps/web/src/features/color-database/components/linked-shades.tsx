import type { ShadeRef } from "@color-bank-hub/contracts/shade";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const maxShown = 2;

export function LinkedShades({ shades }: { shades: ShadeRef[] }) {
  if (shades.length === 0) return <span className="text-muted-foreground">—</span>;
  const rest = shades.slice(maxShown);
  return (
    <div className="space-y-0.5">
      {shades.slice(0, maxShown).map((shade) => (
        <p key={shade.id}>
          {shade.name} · <span className="text-muted-foreground">{shade.product}</span>
        </p>
      ))}
      {rest.length > 0 && (
        <Tooltip>
          <TooltipTrigger render={<p className="cursor-default text-muted-foreground" />}>+{rest.length}</TooltipTrigger>
          <TooltipContent>
            {shades.map((shade) => (
              <p key={shade.id}>
                {shade.brand} · {shade.product} · {shade.name}
              </p>
            ))}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
