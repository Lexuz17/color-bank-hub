import { type Role, roleLabels, roles } from "@color-bank-hub/contracts/rbac";
import type { UserAccount, UserPatch } from "@color-bank-hub/contracts/user";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSession } from "@/features/auth/hooks/use-session";
import { useUpdateUser } from "../hooks/user-mutations";

interface Props {
  user: UserAccount;
}

function useIsSelf(user: UserAccount) {
  return useSession().data?.user.id === user.id;
}

function ConfirmDialog({
  title,
  description,
  onConfirm,
  onClose,
}: {
  title: string;
  description: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <AlertDialog open onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function RoleSelect({ user }: Props) {
  const update = useUpdateUser();
  const [next, setNext] = useState<Role | null>(null);

  return (
    <>
      <Select
        value={user.role}
        disabled={useIsSelf(user) || update.isPending}
        onValueChange={(value) => value && setNext(value as Role)}
      >
        <SelectTrigger size="sm" aria-label={`Role for ${user.name}`}>
          <SelectValue>
            {(value: Role | null) =>
              value ? roleLabels[value] : "Select role"
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {roles.map((role) => (
            <SelectItem key={role} value={role}>
              {roleLabels[role]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {next && (
        <ConfirmDialog
          title="Change role?"
          description={`${user.name} will get the ${roleLabels[next]} role. The change is logged.`}
          onConfirm={() =>
            update.mutate({ id: user.id, changes: { role: next } })
          }
          onClose={() => setNext(null)}
        />
      )}
    </>
  );
}

export function ApproveButton({ user }: Props) {
  const update = useUpdateUser();
  const [confirming, setConfirming] = useState(false);
  const isSelf = useIsSelf(user);

  if (user.status !== "pending") return <span>-</span>;
  const changes: UserPatch = { status: "active" };

  return (
    <>
      <Button
        size="sm"
        disabled={!user.role || isSelf || update.isPending}
        title={user.role ? undefined : "Select a role first"}
        onClick={() => setConfirming(true)}
      >
        Approve
      </Button>
      {confirming && user.role && (
        <ConfirmDialog
          title="Approve account?"
          description={`${user.name} will be activated as ${roleLabels[user.role]}.`}
          onConfirm={() => update.mutate({ id: user.id, changes })}
          onClose={() => setConfirming(false)}
        />
      )}
    </>
  );
}
