import { createFileRoute } from "@tanstack/react-router";
import { DataInputPage } from "@/pages/data-input-page";
export const Route = createFileRoute("/_authenticated/data-input")({
  component: DataInputPage,
});
