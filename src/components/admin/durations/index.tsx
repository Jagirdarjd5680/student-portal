"use client";

import { useCan } from "@/hooks/use-can";
import ConfirmDialog from "@/components/admin/shared/confirm-dialog";
import DataTable from "@/components/admin/shared/data-table";
import FormAlert from "@/components/admin/shared/form-alert";
import RowActions from "@/components/admin/shared/row-actions";
import TableCard from "@/components/admin/shared/table-card";
import { Button } from "@/components/ui/button";
import { useApi } from "@/hooks/use-api";
import { useCrudPage } from "@/hooks/use-crud-page";
import { PlusIcon } from "@/icons";
import { durationService } from "@/services";
import type { Duration } from "@/types";
import { useState } from "react";
import DurationForm from "./duration-form";

export default function Durations() {
  const [search, setSearch] = useState("");
  const { data, loading, reload } = useApi(() => durationService.list());
  const can = useCan();
  const canAdd = can("durations", "add");
  const canEdit = can("durations", "edit");
  const canDelete = can("durations", "delete");
  const crud = useCrudPage<Duration>(durationService.remove, reload);

  const rows = (data || []).filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <FormAlert type="error" message={crud.error} />
      <TableCard
        title="Durations"
        search={search}
        onSearchChange={setSearch}
        actions={
          canAdd ? (
            <Button onClick={crud.openAdd}>
              <PlusIcon /> Add Duration
            </Button>
          ) : undefined
        }
      >
        <DataTable
          loading={loading}
          rows={rows}
          rowKey={(r) => r.id}
          emptyText="No durations found"
          columns={[
            { header: "#", cell: (_r, i) => i + 1 },
            {
              header: "Name",
              cell: (r) => (
                <span className="font-medium text-gray-800 dark:text-white/90">
                  {r.name}
                </span>
              ),
            },
            { header: "Days", cell: (r) => r.days },
            { header: "Description", cell: (r) => r.description || "-" },
            {
              header: "Actions",
              cell: (r) => (
                <RowActions
                  onEdit={canEdit ? () => crud.openEdit(r) : undefined}
                  onDelete={canDelete ? () => crud.askDelete(r) : undefined}
                />
              ),
            },
          ]}
        />
      </TableCard>

      <DurationForm
        open={crud.formOpen}
        duration={crud.editing}
        onClose={crud.closeForm}
        onSaved={crud.onSaved}
      />
      <ConfirmDialog
        open={Boolean(crud.deleting)}
        message={`Delete duration "${crud.deleting?.name}"?`}
        onConfirm={crud.confirmDelete}
        onClose={crud.cancelDelete}
      />
    </div>
  );
}
