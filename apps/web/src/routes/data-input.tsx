import { createFileRoute } from "@tanstack/react-router";
import { DataInputPage } from "@/pages/data-input-page";
export const Route = createFileRoute("/data-input")({
  component: DataInputPage,
});
