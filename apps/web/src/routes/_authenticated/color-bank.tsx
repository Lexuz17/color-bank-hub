import { createFileRoute } from "@tanstack/react-router";
import { ColorBankPage } from "@/pages/color-bank-page";
export const Route = createFileRoute("/_authenticated/color-bank")({
  head: () => ({
    meta: [{ title: "Color Bank" }],
  }),
  component: ColorBankPage,
});
