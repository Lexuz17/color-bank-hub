import { createFileRoute } from "@tanstack/react-router";
import { ColorBankPage } from "@/pages/color-bank-page";
export const Route = createFileRoute("/color-bank")({
  component: ColorBankPage,
});
