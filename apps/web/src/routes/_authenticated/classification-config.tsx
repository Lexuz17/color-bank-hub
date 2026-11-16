import { createFileRoute } from "@tanstack/react-router";
import { assertCan } from "@/features/auth/rbac";
import { ClassificationConfigPage } from "@/features/classification-config/components/classification-config-page";

export const Route = createFileRoute("/_authenticated/classification-config")({
  head: () => ({
    meta: [{ title: "Classification Rules" }],
  }),
  beforeLoad: ({ context }) => assertCan(context.session.user, "classification:manage"),
  component: ClassificationConfigPage,
});
