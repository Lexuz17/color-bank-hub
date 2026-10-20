import { createFileRoute } from "@tanstack/react-router";
import { ShadeMappingPage } from "@/pages/shade-mapping-page";
export const Route = createFileRoute("/shade-mapping")({
  component: ShadeMappingPage,
});
