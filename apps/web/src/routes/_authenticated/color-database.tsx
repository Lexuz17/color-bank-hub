import { createFileRoute } from "@tanstack/react-router";
import { ColorDatabasePage } from "@/pages/color-database-page";
export const Route = createFileRoute("/_authenticated/color-database")({
  component: ColorDatabasePage,
});
