"use client";

import { useCan } from "@/hooks/use-can";
import ConfirmDialog from "@/components/admin/shared/confirm-dialog";
import DataTable from "@/components/admin/shared/data-table";
import RowActions from "@/components/admin/shared/row-actions";
import TableCard from "@/components/admin/shared/table-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PERMISSION_ACTIONS, PERMISSION_MODULES } from "@/data/permissions";
import { useApi } from "@/hooks/use-api";
import { PlusIcon } from "@/icons";
import { getAdmin } from "@/lib/auth";
import { errorMessage } from "@/lib/format";
import { userService, type StaffUser } from "@/services";
import { useState } from "react";
import UserDialog from "./user-dialog";

const FULL = PERMISSION_ACTIONS.length;

// Short per-module summary: "Inquiries (Full)", "Admissions (View, Add)".
function PermissionSummary({ user }: { user: StaffUser }) {
  if (user.is_super)
    return (
      <Badge size="sm" color="success">
        All modules (Full)
      </Badge>
    );
  const items = PERMISSION_MODULES.filter(
    (m) => user.permissions[m.key]?.length,
  );
  if (!items.length)
    return <span className="text-xs text-gray-400">No access</span>;
  return (
    <div className="flex max-w-md flex-wrap gap-1.5">
      {items.map((m) => {
        const acts = user.permissions[m.key] || [];
        const label =
          acts.length === FULL
            ? "Full"
            : PERMISSION_ACTIONS.filter((a) => acts.includes(a.key))
                .map((a) => a.label)
                .join(", ");
        return (
          <Badge
            key={m.key}
            size="sm"
            color={acts.length === FULL ? "primary" : "light"}
          >
            {m.label} ({label})
          </Badge>
        );
      })}
    </div>
  );
}

export default function RolesPage() {
  const { data, loading, error, reload } = useApi(() => userService.list());
  const [dialog, setDialog] = useState<{
    open: boolean;
    user: StaffUser | null;
  }>({ open: false, user: null });
  const [deleteUser, setDeleteUser] = useState<StaffUser | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const me = getAdmin();
  const can = useCan();
  const canAdd = can("roles", "add");
  const canEdit = can("roles", "edit");
  const canDelete = can("roles", "delete");

  return (
    <TableCard
      title="Roles & Permissions"
      actions={
        canAdd ? (
          <Button onClick={() => setDialog({ open: true, user: null })}>
            <PlusIcon /> Create Role
          </Button>
        ) : undefined
      }
    >
      {(error || actionError) && (
        <p className="px-6 pb-3 text-sm text-red-500">{error || actionError}</p>
      )}

      <DataTable
        loading={loading}
        rows={data || []}
        rowKey={(u) => u.id}
        emptyText="No users yet"
        hoverable
        columns={[
          {
            header: "Role",
            cell: (u) => (
              <div className="flex flex-col items-start gap-1">
                <span className="font-semibold whitespace-nowrap text-gray-800 dark:text-white/90">
                  {u.role_name || "-"}
                </span>
                {u.category === "receptionist" && (
                  <Badge size="sm" color="info">
                    Receptionist
                  </Badge>
                )}
                {u.data_scope === "own" && !u.is_super && (
                  <Badge size="sm" color="warning">
                    Own data only
                  </Badge>
                )}
              </div>
            ),
          },
          {
            header: "User",
            cell: (u) => (
              <>
                <p className="font-medium whitespace-nowrap text-gray-800 dark:text-white/90">
                  {u.name}{" "}
                  {u.id === me?.id && (
                    <span className="text-xs text-gray-400">(you)</span>
                  )}
                </p>
                <p className="text-xs">{u.email}</p>
              </>
            ),
          },
          { header: "Phone", cell: (u) => u.phone || "-" },
          {
            header: "Permissions",
            cell: (u) => <PermissionSummary user={u} />,
          },
          {
            header: "Actions",
            cell: (u) => (
              <RowActions
                onEdit={
                  canEdit ? () => setDialog({ open: true, user: u }) : undefined
                }
                onDelete={
                  !canDelete || u.id === me?.id
                    ? undefined
                    : () => setDeleteUser(u)
                }
              />
            ),
          },
        ]}
      />

      {dialog.open && (
        <UserDialog
          open
          user={dialog.user}
          onClose={() => setDialog({ open: false, user: null })}
          onSaved={() => {
            setDialog({ open: false, user: null });
            reload();
          }}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleteUser)}
        title="Delete user?"
        message={`${deleteUser?.name} will no longer be able to log in.`}
        onConfirm={async () => {
          if (!deleteUser) return;
          setActionError(null);
          try {
            await userService.remove(deleteUser.id);
            setDeleteUser(null);
            reload();
          } catch (err) {
            setActionError(errorMessage(err));
            setDeleteUser(null);
          }
        }}
        onClose={() => setDeleteUser(null)}
      />
    </TableCard>
  );
}
