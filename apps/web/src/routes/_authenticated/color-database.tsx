import { createFileRoute } from "@tanstack/react-router";
import { ColorDatabasePage } from "@/features/color-database/components/color-database-page";
export const Route = createFileRoute("/_authenticated/color-database")({
  head: () => ({
    meta: [{ title: "Color Database" }],
  }),
  component: ColorDatabasePage,
});
