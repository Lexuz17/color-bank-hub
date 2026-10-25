import { createFileRoute } from "@tanstack/react-router";
import { ColorBankPage } from "@/pages/color-bank-page";
export const Route = createFileRoute("/_authenticated/color-bank")({
  component: ColorBankPage,
});
