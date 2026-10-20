import { createFileRoute } from "@tanstack/react-router";
import { MyMappingsPage } from "@/pages/my-mappings-page";
export const Route = createFileRoute("/my-mappings")({
  component: MyMappingsPage,
});
