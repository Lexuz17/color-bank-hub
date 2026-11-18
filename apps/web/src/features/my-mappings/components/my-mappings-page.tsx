import { useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useDeferredValue, useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { ApiError, ResultsPagination } from "@/components/shared/request-feedback";
import { EmptyState, LoadingState, PageToolbar, SearchInput } from "@/components/shared/workspace-components";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useDeleteMapping } from "../hooks/mapping-mutations";
import { useMappings } from "../hooks/mapping-queries";
import { MappingCard } from "./mapping-card";
import { type MappingFilters, MappingLibrarySidebar } from "./mapping-library-sidebar";

const PAGE_SIZE = 12;
const noFilters: MappingFilters = { library: "all", folderId: null, brandIds: [], productFormatItemIds: [], search: "", page: 1 };

export function MyMappingsPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState(noFilters);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(filters.search.trim());
  const deleteMapping = useDeleteMapping();

  const mappings = useMappings({
    library: filters.library,
    folderId: filters.folderId ?? undefined,
    brandIds: filters.brandIds.join(",") || undefined,
    productFormatItemIds: filters.productFormatItemIds.join(",") || undefined,
    search: deferredSearch || undefined,
    page: filters.page,
    pageSize: PAGE_SIZE,
  });
  const folders = mappings.data?.counts.folders ?? [];
  const title = folders.find((folder) => folder.id === filters.folderId)?.name ?? (filters.library === "mine" ? "Mine" : "All mappings");

  const changeFilters = (patch: Partial<MappingFilters>) => setFilters({ ...filters, page: 1, ...patch });

  return (
    <PageShell section="My Mappings" sidebar={<MappingLibrarySidebar counts={mappings.data?.counts} filters={filters} onChange={changeFilters} />}>
      <div className="flex min-h-full flex-col">
        <PageToolbar title={title}>
          <SearchInput placeholder="Search mappings or shades…" value={filters.search} onValueChange={(value) => changeFilters({ search: value })} />
          <Button onClick={() => void navigate({ to: "/shade-mapping" })}>
            <Plus />
            New mapping
          </Button>
        </PageToolbar>

        <div className="flex flex-1 flex-col p-5">
          {mappings.isPending ? (
            <LoadingState label="Loading mappings…" />
          ) : mappings.isError ? (
            <ApiError error={mappings.error} retry={() => void mappings.refetch()} />
          ) : mappings.data.items.length === 0 ? (
            <EmptyState title="No mappings found" description="Generate and save a shade map in Shade Mapping, or change the filters." />
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {mappings.data.items.map((card) => (
                  <MappingCard key={card.id} card={card} folders={folders} onDelete={setDeleteId} />
                ))}
              </div>
              <div className="mt-auto pt-4">
                <ResultsPagination
                  page={filters.page}
                  total={mappings.data.pagination.total}
                  pageSize={PAGE_SIZE}
                  disabled={mappings.isFetching}
                  onPageChange={(page) => changeFilters({ page })}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete mapping?</AlertDialogTitle>
            <AlertDialogDescription>This removes the saved mapping. It cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) deleteMapping.mutate(deleteId);
                setDeleteId(null);
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
