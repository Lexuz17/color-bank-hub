import { createFileRoute } from "@tanstack/react-router";
import { ShadeMappingPage } from "@/features/shade-mapping/components/shade-mapping-page";

export interface ShadeMappingSearch {
  itemId?: number;
  shadeIds?: string;
}

export const Route = createFileRoute("/_authenticated/shade-mapping")({
  head: () => ({
    meta: [{ title: "Shade Mapping" }],
  }),
  validateSearch: (search: Record<string, unknown>): ShadeMappingSearch => ({
    itemId: search.itemId ? Number(search.itemId) : undefined,
    shadeIds: typeof search.shadeIds === "string" ? search.shadeIds : undefined,
  }),
  component: ShadeMappingPage,
});
