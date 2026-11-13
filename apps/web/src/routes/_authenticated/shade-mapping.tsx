import { createFileRoute } from "@tanstack/react-router";
import { ShadeMappingPage } from "@/features/shade-mapping/components/shade-mapping-page";
export const Route = createFileRoute("/_authenticated/shade-mapping")({
  component: ShadeMappingPage,
});
