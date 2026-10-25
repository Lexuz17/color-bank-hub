import { createFileRoute } from "@tanstack/react-router";
import { MyMappingsPage } from "@/pages/my-mappings-page";
export const Route = createFileRoute("/_authenticated/my-mappings")({
  component: MyMappingsPage,
});
