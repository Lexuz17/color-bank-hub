import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

const buttonVariants = cva(
  [
    "group/button inline-flex shrink-0 items-center justify-center",
    "rounded-md border border-transparent bg-clip-padding",
    "text-xs font-medium whitespace-nowrap",
    "transition-colors duration-150",
    "outline-none select-none",
    "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30",
    "active:translate-y-px",
    "disabled:pointer-events-none disabled:opacity-45",
    "aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
    "[&_svg:not([class*='size-'])]:size-4",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/85",

        outline:
          "border-border bg-card text-foreground hover:border-muted-foreground/30 hover:bg-muted/70",

        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",

        ghost: "text-foreground hover:bg-muted hover:text-foreground",

        destructive: "bg-destructive text-white hover:bg-destructive/90",

        "destructive-outline":
          "border-destructive/25 bg-destructive/5 text-destructive hover:border-destructive/40 hover:bg-destructive/10",

        link: "text-primary underline-offset-4 hover:underline",
      },

      size: {
        default:
          "h-8 gap-2 px-3.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",

        xs: "h-6 gap-1 rounded px-2 text-xs [&_svg:not([class*='size-'])]:size-3",

        sm: "h-8 gap-1.5 rounded-md px-3 text-xs [&_svg:not([class*='size-'])]:size-3.5",

        lg: "h-10 gap-2 px-5",

        xl: "h-11 gap-2.5 rounded-lg px-6",

        icon: "size-9",

        "icon-xs": "size-6 rounded",

        "icon-sm": "size-8",

        "icon-lg": "size-10 rounded-lg",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
