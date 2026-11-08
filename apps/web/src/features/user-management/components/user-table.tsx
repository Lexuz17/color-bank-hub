import type { ColumnDef } from "@tanstack/react-table";
import type { UserAccount, UserStatus } from "@color-bank-hub/contracts/user";
import { StatusBadge } from "@/components/shared/workspace-components";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DataTable } from "@/components/ui/data-table";
import { formatDateTime } from "@/lib/date";
import { ApproveButton, RoleSelect } from "./user-actions";

const statusLabels = {
  pending: "Pending Approval",
  active: "Active",
  disabled: "Disabled",
} as const satisfies Record<UserStatus, string>;

const initials = (name: string) =>
  name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const columns: ColumnDef<UserAccount>[] = [
  {
    accessorKey: "name",
    header: "User",
    cell: ({ row }) => (
      <span className="flex items-center gap-2">
        <Avatar size="sm">
          <AvatarFallback>{initials(row.original.name)}</AvatarFallback>
        </Avatar>
        {row.original.name}
      </span>
    ),
  },
  { accessorKey: "email", header: "Email" },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => <RoleSelect user={row.original} />,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge status={statusLabels[row.original.status]} />
    ),
  },
  {
    accessorKey: "lastLoginAt",
    header: "Last login",
    cell: ({ row }) =>
      row.original.lastLoginAt
        ? formatDateTime(row.original.lastLoginAt)
        : "Never",
  },
  {
    id: "action",
    header: "Action",
    cell: ({ row }) => <ApproveButton user={row.original} />,
  },
];

export function UserTable({ users }: { users: UserAccount[] }) {
  return (
    <DataTable
      columns={columns}
      data={users}
      searchColumn="name"
      searchPlaceholder="Search users…"
    />
  );
}
