import { createFileRoute } from "@tanstack/react-router";
import { assertCan } from "@/features/auth/rbac";
import { UserManagementPage } from "@/features/user-management/components/user-management-page";
export const Route = createFileRoute("/_authenticated/user-management")({
  beforeLoad: ({ context }) => assertCan(context.session.user, "user:manage"),
  component: UserManagementPage,
});
