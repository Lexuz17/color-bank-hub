import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { PageShell } from "@/components/layout/page-shell";
import {
  PageToolbar,
  StatusBadge,
} from "@/components/shared/workspace-components";
import { DataTable } from "@/components/ui/data-table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
type Account = {
  name: string;
  email: string;
  role: string;
  status: "Active" | "Pending Approval";
};
const accounts: Account[] = [
  {
    name: "Eugenia Clarissa",
    email: "eugenia@example.com",
    role: "Admin",
    status: "Active",
  },
  {
    name: "Namira Fania",
    email: "namira@example.com",
    role: "R&D",
    status: "Pending Approval",
  },
  {
    name: "Hana Athaya",
    email: "hana@example.com",
    role: "TSI",
    status: "Active",
  },
  {
    name: "Elsabella Adiguna",
    email: "elsabella@example.com",
    role: "R&D",
    status: "Active",
  },
  {
    name: "Nadia Putri",
    email: "nadia@example.com",
    role: "PID",
    status: "Active",
  },
];
export function UserManagementPage() {
  const [users, setUsers] = useState(accounts);
  const columns: ColumnDef<Account>[] = [
    {
      accessorKey: "name",
      header: "User",
      cell: ({ row }) => (
        <span className="flex items-center gap-2">
          <Avatar size="sm">
            <AvatarFallback>
              {row.original.name
                .split(" ")
                .map((word) => word[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          {row.original.name}
        </span>
      ),
    },
    { accessorKey: "email", header: "Email" },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => <Badge variant="secondary">{row.original.role}</Badge>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "action",
      header: "Action",
      cell: ({ row }) =>
        row.original.status === "Pending Approval" ? (
          <Button
            size="xs"
            variant="outline"
            onClick={() =>
              setUsers((prev) =>
                prev.map((user) =>
                  user.email === row.original.email
                    ? { ...user, status: "Active" }
                    : user,
                ),
              )
            }
          >
            Approve demo account
          </Button>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
  ];
  return (
    <PageShell section="User Management">
      <PageToolbar
        title="User Management"
        description="Website Admin · demonstration accounts"
      />
      <div className="space-y-5 p-5">
        <DataTable
          columns={columns}
          data={users}
          searchColumn="name"
          searchPlaceholder="Search users…"
        />
        <Alert variant="warning">
          <AlertDescription>
            Local prototype only. In the live system, roles must be verified
            against the company HR directory via SSO/SCIM. Sensitive role
            changes require verification and audit logging.
          </AlertDescription>
        </Alert>
      </div>
    </PageShell>
  );
}
