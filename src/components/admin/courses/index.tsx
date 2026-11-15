"use client";

import { useCan } from "@/hooks/use-can";
import ConfirmDialog from "@/components/admin/shared/confirm-dialog";
import DataTable from "@/components/admin/shared/data-table";
import FormAlert from "@/components/admin/shared/form-alert";
import RowActions from "@/components/admin/shared/row-actions";
import TableCard from "@/components/admin/shared/table-card";
import { Button } from "@/components/ui/button";
import { useApi, useDebounce } from "@/hooks/use-api";
import { useCrudPage } from "@/hooks/use-crud-page";
import { PlusIcon } from "@/icons";
import { formatCurrency } from "@/lib/format";
import { courseService } from "@/services";
import type { Course } from "@/types";
import { useState } from "react";
import CourseForm from "./course-form";

export default function Courses() {
  const [search, setSearch] = useState("");
  const q = useDebounce(search);
  const { data, loading, reload } = useApi(
    () => courseService.list({ search: q }),
    [q],
  );
  const can = useCan();
  const canAdd = can("courses", "add");
  const canEdit = can("courses", "edit");
  const canDelete = can("courses", "delete");
  const crud = useCrudPage<Course>(courseService.remove, reload);

  return (
    <div className="space-y-4">
      <FormAlert type="error" message={crud.error} />
      <TableCard
        title="Courses"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search course or category"
        actions={
          canAdd ? (
            <Button onClick={crud.openAdd}>
              <PlusIcon /> Add Course
            </Button>
          ) : undefined
        }
      >
        <DataTable
          loading={loading}
          rows={data || []}
          rowKey={(r) => r.id}
          emptyText="No courses found"
          columns={[
            { header: "#", cell: (_r, i) => i + 1 },
            {
              header: "Course Name",
              cell: (r) => (
                <span className="font-medium text-gray-800 dark:text-white/90">
                  {r.name}
                </span>
              ),
            },
            { header: "Category", cell: (r) => r.category_name || "-" },
            { header: "Fee", cell: (r) => formatCurrency(r.fee) },
            { header: "Duration", cell: (r) => r.duration_name || "-" },
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

      <CourseForm
        open={crud.formOpen}
        course={crud.editing}
        onClose={crud.closeForm}
        onSaved={crud.onSaved}
      />
      <ConfirmDialog
        open={Boolean(crud.deleting)}
        message={`Delete course "${crud.deleting?.name}"?`}
        onConfirm={crud.confirmDelete}
        onClose={crud.cancelDelete}
      />
    </div>
  );
}
