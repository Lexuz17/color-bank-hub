import { cn } from "@/lib/utils";

const steps = ["Format", "Select SKUs", "Generate"];

// Progress only, not clickable. Steps before `active` are done (green ring).
export function MappingSteps({ active }: { active: number }) {
  return (
    <ol aria-label="Mapping steps" className="grid grid-cols-3 border-b">
      {steps.map((step, index) => {
        const done = index < active;
        return (
          <li
            key={step}
            aria-current={index === active ? "step" : undefined}
            className={cn(
              "flex items-center justify-center gap-1.5 border-b-2 border-transparent px-1 py-2.5 text-[11px] whitespace-nowrap text-muted-foreground",
              index === active && "border-primary font-medium text-primary",
            )}
          >
            <span
              className={cn(
                "flex size-4 shrink-0 items-center justify-center rounded-full border text-[9px]",
                done && "border-success-foreground text-success-foreground",
                index === active && "border-primary bg-primary text-primary-foreground",
              )}
            >
              {index + 1}
            </span>
            {step}
            {done && <span className="sr-only">(done)</span>}
          </li>
        );
      })}
    </ol>
  );
}
