import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  Folder,
  MapPin,
  Palette,
  Plus,
} from "lucide-react";
import { useDeferredValue, useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { SearchInput } from "@/components/shared/workspace-components";
import { Badge } from "@/components/ui/badge";
import { useCan } from "@/features/auth/hooks/use-can";
import { useShadeSearch, useShadeTotal } from "@/api/shades/shade-queries";
import { useReportTotal } from "@/api/reports/report-queries";

export function HomePage() {
  const [search, setSearch] = useState("");
  const query = useDeferredValue(search.trim());
  const results = useShadeSearch(query);
  const shadeTotal = useShadeTotal();

  const pendingReports = useReportTotal({ status: "pending" }, useCan("report:resolve"));

  const cards = [
    {
      title: "Color database",
      to: "/color-database",
      icon: Folder,
      description: `Browse all ${shadeTotal.data?.toLocaleString("en-US") ?? "…"} product shades.`,
    },
    {
      title: "Shade mapping",
      to: "/shade-mapping",
      icon: MapPin,
      description:
        "Select SKUs and auto-generate a season or color grid map instantly.",
      badge: "Auto-placed",
    },
    {
      title: "Color bank",
      to: "/color-bank",
      icon: Palette,
      description: "Prototype shades to fill gaps in current product mapping.",
    },
    {
      title: "Report",
      to: "/report",
      icon: AlertTriangle,
      description: "Submit data issues or request shade corrections.",
      badge:
        pendingReports.data === undefined
          ? undefined
          : `${pendingReports.data} pending`,
    },
  ];

  return (
    <PageShell section="Home">
      <section className="relative overflow-hidden border-b bg-secondary/35 px-6 py-12 lg:px-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 -right-20 size-80 rounded-full border-[40px] border-secondary/50"
        />
        <div className="relative max-w-xl">
          <p className="mb-3 flex items-center gap-3 text-xs text-muted-foreground">
            welcome to{" "}
            <span aria-hidden="true" className="h-px w-16 bg-border" />
          </p>
          <h1 className="font-display text-4xl leading-tight lg:text-5xl">
            Color Bank &<br />
            <span className="text-primary">Shade Mapping</span> Hub
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            A workspace for exploring, mapping, and managing lip products shades
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link
              to="/color-database"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border bg-card px-4 text-sm font-medium hover:bg-muted"
            >
              <MapPin className="size-4 text-primary" />
              Explore Shade Mapping
            </Link>
            <Link
              to="/shade-mapping"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="size-4" />
              Start New Mapping
            </Link>
          </div>
          <SearchInput
            value={search}
            onValueChange={setSearch}
            className="mt-4"
          />
          {query.length >= 2 && (
            <div className="mt-2 rounded-md border bg-card p-1">
              {results.isPending && (
                <p className="p-2 text-xs text-muted-foreground">Searching…</p>
              )}
              {results.isError && (
                <p className="p-2 text-xs text-destructive">
                  Search failed. Try again.
                </p>
              )}
              {results.data?.length === 0 && (
                <p className="p-2 text-xs text-muted-foreground">
                  No matching shades.
                </p>
              )}
              {results.data?.map((shade) => (
                // shortcut: Color Database does not read a search param yet, so results open the page unfiltered.
                <Link
                  key={shade.id}
                  to="/color-database"
                  className="flex items-center gap-2 rounded p-2 text-xs hover:bg-muted"
                >
                  <span
                    aria-hidden="true"
                    className="size-3 shrink-0 rounded-full border"
                    style={{ backgroundColor: shade.hex }}
                  />
                  <span className="truncate">
                    {shade.brand.name} · {shade.product.name} · {shade.name}
                  </span>
                  {shade.sku && (
                    <span className="ml-auto text-muted-foreground">
                      {shade.sku}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
      <section className="p-6 lg:px-12">
        <h2 className="mb-4 flex items-center gap-4 text-sm font-medium">
          Quick access{" "}
          <span aria-hidden="true" className="h-px max-w-sm flex-1 bg-border" />
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((item) => (
            <Link
              key={item.title}
              to={item.to}
              className="group flex flex-col rounded-md border bg-card p-5 hover:border-primary/40"
            >
              <item.icon className="mb-4 size-8 rounded-md bg-secondary p-1.5 text-primary" />
              <h3 className="text-base font-medium">{item.title}</h3>
              <p className="mt-2 min-h-12 text-xs leading-relaxed text-muted-foreground">
                {item.description}
              </p>
              <div className="mt-5 flex items-center">
                {item.badge && <Badge variant="secondary">{item.badge}</Badge>}
                <ArrowRight className="ml-auto size-4 text-muted-foreground group-hover:text-primary" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
