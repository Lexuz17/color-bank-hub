import { PageShell } from "@/components/layout/page-shell";
import { ApiError } from "@/components/shared/request-feedback";
import {
  LoadingState,
  PageToolbar,
} from "@/components/shared/workspace-components";
import { useUsers } from "../hooks/use-users";
import { UserTable } from "./user-table";

export function UserManagementPage() {
  const users = useUsers();
  return (
    <PageShell section="User Management">
      <PageToolbar
        title="User Management"
        description="Accounts that have signed in to Color Bank"
      />
      <div className="space-y-5 p-5">
        {users.isPending ? (
          <LoadingState label="Loading users…" />
        ) : users.isError ? (
          <ApiError error={users.error} retry={() => void users.refetch()} />
        ) : (
          <UserTable users={users.data} />
        )}
      </div>
    </PageShell>
  );
}
