import { createFileRoute } from "@tanstack/react-router";
import { ShadeMappingPage } from "@/features/shade-mapping/components/shade-mapping-page";

export interface ShadeMappingSearch {
  itemId?: number;
  brandId?: string;
  mappingId?: string;
}

export const Route = createFileRoute("/_authenticated/shade-mapping")({
  head: () => ({
    meta: [{ title: "Shade Mapping" }],
  }),
  validateSearch: (search: Record<string, unknown>): ShadeMappingSearch => ({
    itemId: search.itemId ? Number(search.itemId) : undefined,
    brandId: typeof search.brandId === "string" ? search.brandId : undefined,
    mappingId: typeof search.mappingId === "string" ? search.mappingId : undefined,
  }),
  component: ShadeMappingPage,
});
