import { Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Folder,
  MapPin,
  Palette,
  AlertTriangle,
  ArrowRight,
  Plus,
} from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { SearchInput } from "@/components/shared/workspace-components";
import { tableRows } from "@/lib/data/demo-shades";
import { Button } from "@/components/ui/button";
import { useSignOut } from "@/features/auth/hooks/auth-mutation";
export function HomePage() {
  const [search, setSearch] = useState("");
  const logout = useSignOut();

  return (
    <PageShell section="Home">
      <section className="relative overflow-hidden border-b bg-secondary/35 px-6 py-12 lg:px-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 -right-20 size-80 rounded-full border-[40px] border-secondary/50"
        />
        <div className="relative">
          <p className="mb-3 text-xs text-muted-foreground">welcome to</p>
          <h1 className="font-display text-4xl leading-tight lg:text-5xl">
            Color Bank &<br />
            <span className="text-primary">Shade Mapping</span> Hub
          </h1>
          <p className="mt-4 max-w-md text-sm text-muted-foreground">
            A workspace for exploring, mapping, and managing lip products shades
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/color-database"
              className="inline-flex h-8 items-center rounded-md border bg-card px-4 text-xs"
            >
              Explore Shade Mapping
            </Link>
            <Link
              to="/shade-mapping"
              className="inline-flex h-8 items-center gap-2 rounded-md bg-primary px-4 text-xs text-primary-foreground"
            >
              <Plus className="size-3" />
              Start New Mapping
            </Link>

            <Button
              type="button"
              variant="destructive"
              disabled={logout.isPending}
              onClick={() => logout.mutate()}
            >
              {logout.isPending ? "Logging out..." : "Logout"}
            </Button>
          </div>
          <SearchInput
            value={search}
            onValueChange={setSearch}
            className="mt-5 max-w-lg"
          />
          {search && (
            <div className="mt-2 max-w-lg rounded-md border bg-card p-2">
              {tableRows
                .filter((row) =>
                  `${row.brand} ${row.product} ${row.shade}`
                    .toLowerCase()
                    .includes(search.toLowerCase()),
                )
                .map((row) => (
                  <Link
                    key={row.shade}
                    to="/color-database"
                    className="block rounded p-2 text-xs hover:bg-muted"
                  >
                    {row.brand} · {row.product} · {row.shade}
                  </Link>
                ))}
              {!tableRows.some((row) =>
                `${row.brand} ${row.product} ${row.shade}`
                  .toLowerCase()
                  .includes(search.toLowerCase()),
              ) && (
                <p className="p-2 text-xs text-muted-foreground">
                  No matching shades.
                </p>
              )}
            </div>
          )}
        </div>
      </section>
      <section className="p-6 lg:px-12">
        <h2 className="mb-4 border-b pb-3 text-sm font-medium">Quick access</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              title: "Color database",
              to: "/color-database",
              icon: Folder,
              description: "Browse and inspect lip product shades.",
            },
            {
              title: "Shade mapping",
              to: "/shade-mapping",
              icon: MapPin,
              description: "Select SKUs and generate a season map.",
            },
            {
              title: "Color bank",
              to: "/color-bank",
              icon: Palette,
              description:
                "Prototype shades to fill gaps in current product mapping.",
            },
            {
              title: "Report",
              to: "/report",
              icon: AlertTriangle,
              description: "Submit data issues or request shade corrections.",
            },
          ].map((item) => (
            <Link
              key={item.title}
              to={item.to}
              className="group rounded-md border bg-card p-5 hover:border-primary/40"
            >
              <item.icon className="mb-4 size-7 rounded-md bg-secondary p-1.5 text-primary" />
              <h3 className="text-sm font-medium">{item.title}</h3>
              <p className="mt-2 min-h-12 text-xs leading-relaxed text-muted-foreground">
                {item.description}
              </p>
              <ArrowRight className="mt-5 ml-auto size-3 text-muted-foreground group-hover:text-primary" />
            </Link>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
