import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Pin, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { PageShell } from "@/components/layout/page-shell";
import {
  PageToolbar,
  SearchInput,
  EmptyState,
  ShadeSwatch,
} from "@/components/shared/workspace-components";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  readMappings,
  writeMappings,
  type SavedMapping,
} from "@/lib/data/local-mappings";
import { tableRows } from "@/lib/data/demo-shades";
export function MyMappingsPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState(readMappings);
  const [search, setSearch] = useState("");
  const [pinned, setPinned] = useState(false);
  const [remove, setRemove] = useState<string | null>(null);
  const update = (next: SavedMapping[]) => {
    try {
      writeMappings(next);
      setItems(next);
    } catch {
      toast.error("Unable to update local storage.");
    }
  };
  return (
    <PageShell
      section="My Mappings"
      sidebar={
        <nav aria-label="Mapping library" className="space-y-1 p-3 text-xs">
          <h2 className="px-2 py-3 text-[10px] text-muted-foreground">
            LIBRARY
          </h2>
          <Button
            variant={!pinned ? "secondary" : "ghost"}
            className="w-full justify-between"
            onClick={() => setPinned(false)}
          >
            All mappings<span>{items.length}</span>
          </Button>
          <Button
            variant={pinned ? "secondary" : "ghost"}
            className="w-full justify-between"
            onClick={() => setPinned(true)}
          >
            Pinned<span>{items.filter((item) => item.pinned).length}</span>
          </Button>
        </nav>
      }
    >
      <PageToolbar
        title="My Mappings"
        description="Your locally saved shade maps"
      >
        <SearchInput
          value={search}
          onValueChange={setSearch}
          placeholder="Search mappings…"
        />
        <Button
          onClick={() => {
            sessionStorage.removeItem("color-bank-open-mapping");
            void navigate({ to: "/shade-mapping" });
          }}
        >
          <Plus />
          New mapping
        </Button>
      </PageToolbar>
      <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
        {items
          .filter(
            (item) =>
              (!pinned || item.pinned) &&
              item.name.toLowerCase().includes(search.toLowerCase()),
          )
          .map((item) => (
            <article key={item.id} className="rounded-md border bg-card p-4">
              <div className="mb-4 flex min-h-24 flex-wrap items-center justify-center gap-2 rounded bg-muted">
                {tableRows
                  .filter((row) => item.shadeNames.includes(row.shade))
                  .map((row) => (
                    <ShadeSwatch key={row.shade} hex={row.hex} />
                  ))}
              </div>
              <h2 className="text-sm font-medium">{item.name}</h2>
              <p className="my-2 text-[11px] text-muted-foreground">
                By season · {item.shadeNames.length} shades ·{" "}
                {new Date(item.updated).toLocaleDateString()}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    sessionStorage.setItem("color-bank-open-mapping", item.id);
                    void navigate({ to: "/shade-mapping" });
                  }}
                >
                  Open mapping
                </Button>
                <Button
                  aria-label={
                    item.pinned ? `Unpin ${item.name}` : `Pin ${item.name}`
                  }
                  size="icon-sm"
                  variant={item.pinned ? "secondary" : "ghost"}
                  onClick={() =>
                    update(
                      items.map((value) =>
                        value.id === item.id
                          ? { ...value, pinned: !value.pinned }
                          : value,
                      ),
                    )
                  }
                >
                  <Pin />
                </Button>
                <Button
                  aria-label={`Delete ${item.name}`}
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => setRemove(item.id)}
                >
                  <Trash2 />
                </Button>
              </div>
            </article>
          ))}
      </div>
      {!items.filter(
        (item) =>
          (!pinned || item.pinned) &&
          item.name.toLowerCase().includes(search.toLowerCase()),
      ).length && (
        <EmptyState
          title="No saved mappings"
          description="Generate and save a shade map to build your library."
        />
      )}
      <AlertDialog
        open={!!remove}
        onOpenChange={(open) => {
          if (!open) setRemove(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete mapping?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the saved mapping from this browser.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                update(items.filter((item) => item.id !== remove));
                setRemove(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageShell>
  );
}
