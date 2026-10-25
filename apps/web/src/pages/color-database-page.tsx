import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/layout/page-shell";
import {
  PageToolbar,
  EmptyState,
  LoadingState,
} from "@/components/shared/workspace-components";
import { ProductDetailPanel } from "@/components/shared/product-detail-panel";
import { CatalogSidebar } from "@/components/api/catalog-sidebar";
import { ShadeDatabase } from "@/components/api/shade-database";
import { ApiError } from "@/components/api/api-feedback";
import { api } from "@/services/color-bank-api";
const tones = { warm: "Warm", neutral: "Neutral", cool: "Cool" } as const;
const seasons = {
  spring: "Spring",
  summer: "Summer",
  autumn: "Autumn",
  winter: "Winter",
} as const;
export function ColorDatabasePage() {
  const [format, setFormat] = useState<number | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const profile = useQuery({
    queryKey: ["shade", selected],
    queryFn: ({ signal }) => api.shade(selected!, signal),
    enabled: !!selected,
  });
  const shade = profile.data;
  const detail = profile.isFetching ? (
    <div className="p-4">
      <LoadingState label="Loading shade profile…" />
    </div>
  ) : profile.isError ? (
    <div className="p-3">
      <ApiError error={profile.error} retry={() => void profile.refetch()} />
    </div>
  ) : shade ? (
    <ProductDetailPanel
      key={shade.id}
      shade={{
        brand: shade.brand.name,
        product: shade.product.name,
        shade: shade.name,
        hex: shade.hex,
        undertone: shade.undertone ? tones[shade.undertone] : null,
        season: shade.season ? seasons[shade.season] : null,
        format: shade.formatItem.name,
        ingredients:
          shade.product.ingredientsInci ?? "No ingredients recorded.",
        composition: shade.composition ?? undefined,
        lipPhotoUrl: shade.lipPhotoUrl ?? undefined,
        swatchPhotoUrl: shade.swatchPhotoUrl ?? undefined,
      }}
      canViewComposition={shade.brand.isOwn}
    />
  ) : (
    <EmptyState
      title="Product detail"
      description="Select a shade to view its profile, ingredients, and composition."
    />
  );
  return (
    <PageShell
      section="Color Database"
      sidebar={
        <CatalogSidebar
          value={format}
          onChange={(value) => {
            setFormat(value);
            setSelected(null);
          }}
        />
      }
      detailPanel={detail}
    >
      <PageToolbar
        title="Color Database"
        description="Browse products and shades from the database"
      />
      <div className="p-5">
        <ShadeDatabase
          key={format ?? "all"}
          formatItemId={format}
          onInspect={setSelected}
        />
        <div className="mt-5 rounded-md border xl:hidden">{detail}</div>
      </div>
    </PageShell>
  );
}
