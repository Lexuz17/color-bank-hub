import { createFileRoute } from "@tanstack/react-router";
import { assertCan } from "@/features/auth/rbac";
import { DataInputPage } from "@/pages/data-input-page";
export const Route = createFileRoute("/_authenticated/data-input")({
  beforeLoad: ({ context }) => assertCan(context.session.user, "catalog:write"),
  component: DataInputPage,
});
