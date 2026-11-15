"use client";

import { useCan } from "@/hooks/use-can";
import ComponentCard from "@/components/common/component-card";
import ConfirmDialog from "@/components/admin/shared/confirm-dialog";
import DataTable from "@/components/admin/shared/data-table";
import FormAlert from "@/components/admin/shared/form-alert";
import FormField from "@/components/admin/shared/form-field";
import RowActions from "@/components/admin/shared/row-actions";
import SelectBox from "@/components/admin/shared/select-field";
import TableCard from "@/components/admin/shared/table-card";
import {
  useCourses,
  useDurations,
} from "@/components/admin/shared/use-lookups";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useApi } from "@/hooks/use-api";
import { useCrudPage } from "@/hooks/use-crud-page";
import { PlusIcon } from "@/icons";
import { studyMaterialService } from "@/services";
import type { StudyMaterial } from "@/types";
import { useState } from "react";
import MaterialForm from "./material-form";
import MaterialView from "./material-view";

export default function StudyMaterials() {
  const { courseOptions } = useCourses();
  const { durationOptions } = useDurations();
  const [courseId, setCourseId] = useState("");
  const [durationId, setDurationId] = useState("");
  const [loaded, setLoaded] = useState<{
    course: string;
    duration: string;
  } | null>(null);
  const [selectError, setSelectError] = useState<string | null>(null);
  const [viewing, setViewing] = useState<StudyMaterial | null>(null);

  const q = { course_id: loaded?.course, duration_id: loaded?.duration };
  const enabled = Boolean(loaded);
  const list = useApi(() => studyMaterialService.list(q), [loaded], {
    enabled,
  });
  const topics = useApi(() => studyMaterialService.topics(q), [loaded], {
    enabled,
  });

  const reloadAll = async () => {
    await Promise.all([list.reload(), topics.reload()]);
  };
  const can = useCan();
  const canAdd = can("study_materials", "add");
  const canEdit = can("study_materials", "edit");
  const canDelete = can("study_materials", "delete");
  const crud = useCrudPage<StudyMaterial>(
    studyMaterialService.remove,
    reloadAll,
  );

  const load = () => {
    if (!courseId || !durationId) {
      setSelectError("Please select Course and Duration");
      return;
    }
    setSelectError(null);
    setLoaded({ course: courseId, duration: durationId });
  };

  const courseName = courseOptions.find(
    (c) => c.value === loaded?.course,
  )?.label;
  const durationName = durationOptions.find(
    (d) => d.value === loaded?.duration,
  )?.label;

  return (
    <div className="space-y-6">
      <ComponentCard title="Select Course & Duration">
        <FormAlert type="error" message={selectError} />
        <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-3">
          <FormField label="Course" required>
            <SelectBox
              options={courseOptions}
              value={courseId}
              onChange={setCourseId}
              placeholder="Select Course"
            />
          </FormField>
          <FormField label="Duration" required>
            <SelectBox
              options={durationOptions}
              value={durationId}
              onChange={setDurationId}
              placeholder="Select Duration"
            />
          </FormField>
          <div>
            <Button onClick={load}>Load Materials</Button>
          </div>
        </div>
      </ComponentCard>

      {loaded && (
        <>
          <FormAlert type="error" message={crud.error || list.error} />
          <TableCard
            title={`Study Materials — ${courseName || ""} (${durationName || ""})`}
            actions={
              canAdd ? (
                <Button onClick={crud.openAdd}>
                  <PlusIcon /> Add Study Material
                </Button>
              ) : undefined
            }
          >
            <DataTable
              loading={list.loading}
              rows={list.data || []}
              rowKey={(r) => r.id}
              emptyText="No Study Materials Found"
              columns={[
                {
                  header: "Topic",
                  cell: (r) => (
                    <span className="font-medium text-gray-800 dark:text-white/90">
                      {r.topic}
                    </span>
                  ),
                },
                { header: "Title", cell: (r) => r.title },
                {
                  header: "Type",
                  cell: (r) => (
                    <Badge size="sm" color="info">
                      {r.material_type}
                    </Badge>
                  ),
                },
                {
                  header: "File",
                  cell: (r) => (r.file_path ? "Attached" : "-"),
                },
                {
                  header: "Actions",
                  cell: (r) => (
                    <RowActions
                      onView={() => setViewing(r)}
                      onEdit={canEdit ? () => crud.openEdit(r) : undefined}
                      onDelete={canDelete ? () => crud.askDelete(r) : undefined}
                    />
                  ),
                },
              ]}
            />
          </TableCard>

          <MaterialForm
            open={crud.formOpen}
            material={crud.editing}
            courseId={loaded.course}
            durationId={loaded.duration}
            topics={topics.data || []}
            onClose={crud.closeForm}
            onSaved={crud.onSaved}
          />
        </>
      )}

      <MaterialView material={viewing} onClose={() => setViewing(null)} />
      <ConfirmDialog
        open={Boolean(crud.deleting)}
        message={`Delete study material "${crud.deleting?.title}"?`}
        onConfirm={crud.confirmDelete}
        onClose={crud.cancelDelete}
      />
    </div>
  );
}
