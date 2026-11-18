import { createFileRoute } from "@tanstack/react-router";
import { MyMappingsPage } from "@/features/my-mappings/components/my-mappings-page";
export const Route = createFileRoute("/_authenticated/my-mappings")({
  head: () => ({
    meta: [{ title: "My Mappings" }],
  }),
  component: MyMappingsPage,
});
