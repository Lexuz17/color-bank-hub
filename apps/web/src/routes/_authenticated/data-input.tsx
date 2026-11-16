import { createFileRoute } from "@tanstack/react-router";
import { assertCan } from "@/features/auth/rbac";
import { DataInputPage } from "@/pages/data-input-page";
export const Route = createFileRoute("/_authenticated/data-input")({
  head: () => ({
    meta: [{ title: "Data Input" }],
  }),
  beforeLoad: ({ context }) => assertCan(context.session.user, "catalog:write"),
  component: DataInputPage,
});
