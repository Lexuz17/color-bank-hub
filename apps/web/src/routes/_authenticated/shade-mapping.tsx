import { createFileRoute } from "@tanstack/react-router";
import { ShadeMappingPage } from "@/features/shade-mapping/components/shade-mapping-page";

export interface ShadeMappingSearch {
  itemId?: number;
  productId?: string;
  mappingId?: string;
}

export const Route = createFileRoute("/_authenticated/shade-mapping")({
  head: () => ({
    meta: [{ title: "Shade Mapping" }],
  }),
  validateSearch: (search: Record<string, unknown>): ShadeMappingSearch => ({
    itemId: search.itemId ? Number(search.itemId) : undefined,
    productId: typeof search.productId === "string" ? search.productId : undefined,
    mappingId: typeof search.mappingId === "string" ? search.mappingId : undefined,
  }),
  component: ShadeMappingPage,
});
