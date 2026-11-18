import type { MappingCounts } from "@color-bank-hub/contracts/mapping";
import { Check, Pencil, Plus, Trash2 } from "lucide-react";
import { type ReactNode, useState } from "react";
import { useBrands } from "@/api/brands/brand-queries";
import { useProductFormats } from "@/api/product-formats/product-format-queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useCreateFolder, useDeleteFolder, useRenameFolder } from "../hooks/mapping-mutations";

export interface MappingFilters {
  library: "all" | "mine";
  folderId: string | null;
  brandIds: string[];
  productFormatItemIds: number[];
  search: string;
  page: number;
}

interface Props {
  counts: MappingCounts | undefined;
  filters: MappingFilters;
  onChange: (patch: Partial<MappingFilters>) => void;
}

const toggle = <T,>(list: T[], value: T) => (list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);

function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="border-b pb-1">
      <div className="flex items-center justify-between border-b bg-muted/60 pr-3">
        <h2 className="px-4 py-2 text-[10px] font-medium tracking-wide text-muted-foreground">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function ClearButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="text-[10px] text-primary hover:underline" onClick={onClick}>
      Clear
    </button>
  );
}

function Row({
  active,
  label,
  count,
  onClick,
  multi,
  actions,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
  multi?: boolean;
  actions?: ReactNode;
}) {
  return (
    <div
      aria-current={active ? "true" : undefined}
      className="group relative flex items-center border-l-2 border-transparent hover:bg-muted aria-[current=true]:border-primary aria-[current=true]:bg-accent aria-[current=true]:font-medium aria-[current=true]:text-primary"
    >
      <button type="button" className="flex min-w-0 flex-1 items-center gap-2 py-2 pr-2 pl-4 text-left" onClick={onClick}>
        {multi && active ? <Check className="size-3 shrink-0" /> : <span className="mx-1 size-1 shrink-0 rounded-full bg-chart-2" />}
        <span className="truncate">{label}</span>
        <span
          className={cn(
            "ml-auto rounded-full bg-muted px-1.5 text-[10px] font-normal text-muted-foreground group-aria-[current=true]:bg-primary/10 group-aria-[current=true]:text-primary",
            actions && "group-focus-within:invisible group-hover:invisible",
          )}
        >
          {count}
        </span>
      </button>
      {actions}
    </div>
  );
}

function FolderNameInput({ initial = "", onSubmit, onCancel }: { initial?: string; onSubmit: (name: string) => void; onCancel: () => void }) {
  const [name, setName] = useState(initial);
  return (
    <form
      className="px-3 py-1"
      onSubmit={(event) => {
        event.preventDefault();
        if (name.trim()) onSubmit(name.trim());
      }}
    >
      <Input
        autoFocus
        aria-label="Folder name"
        placeholder="Folder name"
        maxLength={255}
        value={name}
        onChange={(event) => setName(event.target.value)}
        onKeyDown={(event) => event.key === "Escape" && onCancel()}
        onBlur={onCancel}
      />
    </form>
  );
}

export function MappingLibrarySidebar({ counts, filters, onChange }: Props) {
  const brands = useBrands();
  const formats = useProductFormats();
  const createFolder = useCreateFolder();
  const renameFolder = useRenameFolder();
  const deleteFolder = useDeleteFolder();
  const [adding, setAdding] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const noFolder = filters.folderId === null;
  const usedBrands = brands.data?.filter((brand) => counts?.brands[brand.id]) ?? [];
  const usedFormats = formats.data?.flatMap((format) => format.items).filter((item) => counts?.formats[item.id]) ?? [];

  return (
    <nav aria-label="Mapping library" className="h-full overflow-y-auto bg-card text-[11px]">
      <Section title="LIBRARY">
        <Row
          active={noFolder && filters.library === "all"}
          label="All mappings"
          count={counts?.all ?? 0}
          onClick={() => onChange({ library: "all", folderId: null })}
        />
        <Row
          active={noFolder && filters.library === "mine"}
          label="Mine"
          count={counts?.mine ?? 0}
          onClick={() => onChange({ library: "mine", folderId: null })}
        />
      </Section>

      <Section
        title="FOLDERS"
        action={
          <Button variant="ghost" size="icon-xs" aria-label="New folder" onClick={() => setAdding(true)}>
            <Plus className="size-3.5" strokeWidth={1.75} />
          </Button>
        }
      >
        {adding && (
          <FolderNameInput
            onCancel={() => setAdding(false)}
            onSubmit={(name) => {
              createFolder.mutate({ name });
              setAdding(false);
            }}
          />
        )}
        {counts?.folders.map((folder) =>
          renamingId === folder.id ? (
            <FolderNameInput
              key={folder.id}
              initial={folder.name}
              onCancel={() => setRenamingId(null)}
              onSubmit={(name) => {
                renameFolder.mutate({ id: folder.id, name });
                setRenamingId(null);
              }}
            />
          ) : (
            <Row
              key={folder.id}
              active={filters.folderId === folder.id}
              label={folder.name}
              count={folder.count}
              onClick={() => onChange({ library: "mine", folderId: folder.id })}
              actions={
                <span className="absolute top-1/2 right-2 hidden -translate-y-1/2 items-center gap-0.5 group-focus-within:flex group-hover:flex">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="size-5 text-muted-foreground hover:text-foreground"
                    aria-label={`Rename ${folder.name}`}
                    onClick={() => setRenamingId(folder.id)}
                  >
                    <Pencil className="size-3" strokeWidth={1.75} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="size-5 text-muted-foreground hover:text-foreground"
                    aria-label={`Delete ${folder.name}`}
                    onClick={() =>
                      deleteFolder.mutate(folder.id, {
                        onSuccess: () => filters.folderId === folder.id && onChange({ library: "mine", folderId: null }),
                      })
                    }
                  >
                    <Trash2 className="size-3" strokeWidth={1.75} />
                  </Button>
                </span>
              }
            />
          ),
        )}
        {!adding && counts?.folders.length === 0 && <p className="px-4 py-2 text-[10px] text-muted-foreground">No folders yet. Use + to add one.</p>}
      </Section>

      {usedBrands.length > 0 && (
        <Section title="BY BRAND" action={filters.brandIds.length > 0 && <ClearButton onClick={() => onChange({ brandIds: [] })} />}>
          {usedBrands.map((brand) => (
            <Row
              key={brand.id}
              multi
              active={filters.brandIds.includes(brand.id)}
              label={brand.name}
              count={counts?.brands[brand.id] ?? 0}
              onClick={() => onChange({ brandIds: toggle(filters.brandIds, brand.id) })}
            />
          ))}
        </Section>
      )}

      {usedFormats.length > 0 && (
        <Section
          title="BY PRODUCT FORMAT"
          action={filters.productFormatItemIds.length > 0 && <ClearButton onClick={() => onChange({ productFormatItemIds: [] })} />}
        >
          {usedFormats.map((item) => (
            <Row
              key={item.id}
              multi
              active={filters.productFormatItemIds.includes(item.id)}
              label={item.name}
              count={counts?.formats[item.id] ?? 0}
              onClick={() => onChange({ productFormatItemIds: toggle(filters.productFormatItemIds, item.id) })}
            />
          ))}
        </Section>
      )}
    </nav>
  );
}
