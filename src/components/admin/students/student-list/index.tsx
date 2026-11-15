"use client";

import { toast } from "sonner";
import { useCan } from "@/hooks/use-can";
import BulkBar from "@/components/admin/shared/bulk-bar";
import ConfirmDialog from "@/components/admin/shared/confirm-dialog";
import DataTable from "@/components/admin/shared/data-table";
import SelectBox from "@/components/admin/shared/select-field";
import TableCard from "@/components/admin/shared/table-card";
import TablePagination, {
  paginate,
} from "@/components/admin/shared/table-pagination";
import {
  useCourses,
  useDurations,
} from "@/components/admin/shared/use-lookups";
import { Button } from "@/components/ui/button";
import { ADMISSION_PDF_THEME } from "@/data/institute";
import { useApi, useDebounce } from "@/hooks/use-api";
import { Link } from "@/i18n/navigation";
import { PlusIcon } from "@/icons";
import { exportExcel } from "@/lib/export";
import { errorMessage, todaySql } from "@/lib/format";
import { downloadTablePdf } from "@/lib/pdf";
import { inquiryService, studentService } from "@/services";
import { useMemo, useState } from "react";
import { studentColumns } from "./columns";
import { FEE_STATUS_OPTIONS, feeStatus, STUDENT_EXPORT_COLUMNS } from "./utils";

export default function StudentList() {
  const can = useCan();
  const canAdd = can("students", "add");
  const canEdit = can("students", "edit");
  const canDelete = can("students", "delete");
  const canPay = can("payments", "add");
  const { courseOptions } = useCourses();
  const { durationOptions } = useDurations();
  const [search, setSearch] = useState("");
  const [courseId, setCourseId] = useState("");
  const [durationId, setDurationId] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [deleteIds, setDeleteIds] = useState<number[] | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const q = useDebounce(search);

  const { data, loading, error, setData } = useApi(
    () =>
      studentService.list({
        search: q,
        course_id: courseId,
        duration_id: durationId,
      }),
    [q, courseId, durationId],
  );
  const { data: institute } = useApi(() => inquiryService.institute(), []);
  // Fee status is computed, so it is filtered here.
  const rows = useMemo(
    () => (data || []).filter((r) => !status || feeStatus(r) === status),
    [data, status],
  );
  const pageRows = paginate(rows, page, pageSize);
  const selectedRows = rows.filter((r) => selected.has(r.id));
  const exportName = `students-${todaySql()}`;

  const deleteRows = async (ids: number[]) => {
    setActionError(null);
    try {
      await Promise.all(ids.map((id) => studentService.remove(id)));
      toast.success(ids.length > 1 ? `${ids.length} records deleted` : "Deleted successfully");
      setData((prev) => (prev || []).filter((r) => !ids.includes(r.id)));
      setSelected(
        (prev) => new Set([...prev].filter((id) => !ids.includes(id))),
      );
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setDeleteIds(null);
    }
  };

  const filter = (set: (v: string) => void) => (v: string) => {
    set(v);
    setPage(1);
  };

  const columns = studentColumns({
    rows: pageRows,
    canEdit,
    canPay,
    canDelete,
    selected,
    onSelect: (id, checked) =>
      setSelected((prev) => {
        const next = new Set(prev);
        if (checked) next.add(id);
        else next.delete(id);
        return next;
      }),
    onSelectAll: (checked) =>
      setSelected((prev) => {
        const next = new Set(prev);
        pageRows.forEach((r) => (checked ? next.add(r.id) : next.delete(r.id)));
        return next;
      }),
    onDelete: (row) => setDeleteIds([row.id]),
  });

  return (
    <TableCard
      title="All Students"
      search={search}
      onSearchChange={(v) => {
        setSearch(v);
        setPage(1);
      }}
      searchPlaceholder="Search ID, name, email, phone"
      actions={
        canAdd ? (
          <Button nativeButton={false} render={<Link href="/students/add" />}>
            <PlusIcon /> Add Student
          </Button>
        ) : undefined
      }
      filters={
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SelectBox
            size="sm"
            options={courseOptions}
            value={courseId}
            onChange={filter(setCourseId)}
            placeholder="All Courses"
          />
          <SelectBox
            size="sm"
            options={durationOptions}
            value={durationId}
            onChange={filter(setDurationId)}
            placeholder="All Durations"
          />
          <SelectBox
            size="sm"
            options={FEE_STATUS_OPTIONS}
            value={status}
            onChange={filter(setStatus)}
            placeholder="All Fee Status"
          />
        </div>
      }
      footer={
        <TablePagination
          total={rows.length}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(s) => {
            setPageSize(s);
            setPage(1);
          }}
        />
      }
    >
      {(error || actionError) && (
        <p className="px-6 pb-3 text-sm text-red-500">{error || actionError}</p>
      )}

      <BulkBar
        canDelete={canDelete}
        count={selectedRows.length}
        busy={false}
        onExcel={() =>
          exportExcel(selectedRows, STUDENT_EXPORT_COLUMNS, exportName)
        }
        onPdf={() =>
          downloadTablePdf(selectedRows, STUDENT_EXPORT_COLUMNS, {
            title: "Student List",
            subtitle: [`Total: ${selectedRows.length}`],
            fileName: exportName,
            institute: institute?.name,
            theme: ADMISSION_PDF_THEME,
          }).catch((err) => setActionError(errorMessage(err)))
        }
        onDelete={() => setDeleteIds(selectedRows.map((r) => r.id))}
        onClear={() => setSelected(new Set())}
      />

      <DataTable
        loading={loading}
        rows={pageRows}
        rowKey={(r) => r.id}
        emptyText="No students found"
        columns={columns}
        hoverable
      />

      <ConfirmDialog
        open={Boolean(deleteIds)}
        title="Delete student?"
        message={
          deleteIds && deleteIds.length > 1
            ? `${deleteIds.length} students and all their payments will be permanently deleted.`
            : "This student and all their payments will be permanently deleted."
        }
        onConfirm={() => deleteRows(deleteIds || [])}
        onClose={() => setDeleteIds(null)}
      />
    </TableCard>
  );
}
