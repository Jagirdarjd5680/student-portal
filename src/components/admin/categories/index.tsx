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
import { categoryService } from "@/services";
import type { Category } from "@/types";
import { useState } from "react";
import CategoryForm from "./category-form";

export default function Categories() {
  const [search, setSearch] = useState("");
  const { data, loading, reload } = useApi(() => categoryService.list());
  const can = useCan();
  const canAdd = can("categories", "add");
  const canEdit = can("categories", "edit");
  const canDelete = can("categories", "delete");
  const crud = useCrudPage<Category>(categoryService.remove, reload);

  const rows = (data || []).filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <FormAlert type="error" message={crud.error} />
      <TableCard
        title="Categories"
        search={search}
        onSearchChange={setSearch}
        actions={
          canAdd ? (
            <Button onClick={crud.openAdd}>
              <PlusIcon /> Add Category
            </Button>
          ) : undefined
        }
      >
        <DataTable
          loading={loading}
          rows={rows}
          rowKey={(r) => r.id}
          emptyText="No categories found"
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
            { header: "Description", cell: (r) => r.description || "-" },
            { header: "Courses", cell: (r) => r.course_count ?? 0 },
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

      <CategoryForm
        open={crud.formOpen}
        category={crud.editing}
        onClose={crud.closeForm}
        onSaved={crud.onSaved}
      />
      <ConfirmDialog
        open={Boolean(crud.deleting)}
        message={`Delete category "${crud.deleting?.name}"?`}
        onConfirm={crud.confirmDelete}
        onClose={crud.cancelDelete}
      />
    </div>
  );
}
