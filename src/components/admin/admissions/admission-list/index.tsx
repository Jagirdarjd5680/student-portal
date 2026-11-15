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
import { useCourses } from "@/components/admin/shared/use-lookups";
import { Button } from "@/components/ui/button";
import { ADMISSION_PDF_THEME } from "@/data/institute";
import { useApi, useDebounce } from "@/hooks/use-api";
import { Link, useRouter } from "@/i18n/navigation";
import { PlusIcon } from "@/icons";
import { exportExcel } from "@/lib/export";
import { errorMessage, todaySql } from "@/lib/format";
import { downloadTablePdf } from "@/lib/pdf";
import { admissionService, inquiryService } from "@/services";
import type { Admission } from "@/types";
import { useMemo, useState } from "react";
import { downloadAdmissionPdf } from "../admission-pdf";
import { admissionColumns } from "./columns";
import AdmissionDetailsDialog from "./details-dialog";
import { ADMISSION_EXPORT_COLUMNS, isConfirmed, STATUS_OPTIONS } from "./utils";

interface AdmissionListProps {
  status?: "Pending";
  title: string;
}

const EMPTY_FILTERS = { status: "", course_id: "" };

export default function AdmissionList({ status, title }: AdmissionListProps) {
  const router = useRouter();
  const can = useCan();
  const canAdd = can("admissions", "add");
  const canEdit = can("admissions", "edit");
  const canDelete = can("admissions", "delete");
  const { courseOptions } = useCourses();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [busyIds, setBusyIds] = useState<Set<number>>(new Set());
  const [viewRow, setViewRow] = useState<Admission | null>(null);
  const [deleteIds, setDeleteIds] = useState<number[] | null>(null);
  const [pdfId, setPdfId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const q = useDebounce(search);

  const { data, loading, error, setData } = useApi(
    () =>
      admissionService.list({
        search: q,
        ...filters,
        status: status || filters.status,
      }),
    [q, status, filters],
  );
  // Institute name for PDFs (same source as inquiry forms).
  const { data: institute } = useApi(() => inquiryService.institute(), []);
  const rows = useMemo(() => data || [], [data]);
  const pageRows = paginate(rows, page, pageSize);
  const selectedRows = rows.filter((r) => selected.has(r.id));

  const setBusy = (ids: number[], on: boolean) =>
    setBusyIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => (on ? next.add(id) : next.delete(id)));
      return next;
    });

  const changeStatus = async (
    ids: number[],
    newStatus: Admission["status"],
  ) => {
    const keepOnly = status || filters.status;
    setActionError(null);
    setBusy(ids, true);
    try {
      await Promise.all(
        ids.map((id) => admissionService.setStatus(id, newStatus)),
      );
      setData((prev) =>
        (prev || [])
          .map((r) => (ids.includes(r.id) ? { ...r, status: newStatus } : r))
          .filter((r) => !keepOnly || r.status === keepOnly),
      );
      setViewRow((v) =>
        v && ids.includes(v.id) ? { ...v, status: newStatus } : v,
      );
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setBusy(ids, false);
    }
  };
  const toggleStatus = (row: Admission) =>
    changeStatus([row.id], isConfirmed(row) ? "Pending" : "Confirmed");

  const deleteRows = async (ids: number[]) => {
    setActionError(null);
    try {
      await Promise.all(ids.map((id) => admissionService.remove(id)));
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

  const downloadPdf = async (row: Admission) => {
    setActionError(null);
    setPdfId(row.id);
    try {
      await downloadAdmissionPdf(row, institute);
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setPdfId(null);
    }
  };

  const editRow = (row: Admission) => router.push(`/admissions/${row.id}/edit`);
  const exportName = `admissions-${todaySql()}`;

  const columns = admissionColumns({
    rows: pageRows,
    canEdit,
    canDelete,
    selected,
    busyIds,
    pdfId,
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
    onToggleStatus: toggleStatus,
    onView: setViewRow,
    onEdit: editRow,
    onPdf: downloadPdf,
    onDelete: (row) => setDeleteIds([row.id]),
  });

  const setFilter = (key: keyof typeof EMPTY_FILTERS) => (v: string) => {
    setFilters((f) => ({ ...f, [key]: v }));
    setPage(1);
  };

  return (
    <TableCard
      title={title}
      search={search}
      onSearchChange={(v) => {
        setSearch(v);
        setPage(1);
      }}
      searchPlaceholder="Search Name, Father, Phone, Email, No"
      actions={
        canAdd ? (
          <Button nativeButton={false} render={<Link href="/admissions/add" />}>
            <PlusIcon /> Add Admission
          </Button>
        ) : undefined
      }
      filters={
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {!status && (
            <SelectBox
              size="sm"
              options={STATUS_OPTIONS}
              value={filters.status}
              onChange={setFilter("status")}
              placeholder="All Status"
            />
          )}
          <SelectBox
            size="sm"
            options={courseOptions}
            value={filters.course_id}
            onChange={setFilter("course_id")}
            placeholder="All Courses"
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
        canEdit={canEdit}
        canDelete={canDelete}
        count={selectedRows.length}
        busy={selectedRows.some((r) => busyIds.has(r.id))}
        onExcel={() =>
          exportExcel(selectedRows, ADMISSION_EXPORT_COLUMNS, exportName)
        }
        onPdf={() =>
          downloadTablePdf(selectedRows, ADMISSION_EXPORT_COLUMNS, {
            title: "Admission List",
            subtitle: [`Total: ${selectedRows.length}`],
            fileName: exportName,
            institute: institute?.name,
            theme: ADMISSION_PDF_THEME,
          }).catch((err) => setActionError(errorMessage(err)))
        }
        onConfirm={() =>
          changeStatus(
            selectedRows.map((r) => r.id),
            "Confirmed",
          )
        }
        onPending={() =>
          changeStatus(
            selectedRows.map((r) => r.id),
            "Pending",
          )
        }
        onDelete={() => setDeleteIds(selectedRows.map((r) => r.id))}
        onClear={() => setSelected(new Set())}
      />

      <DataTable
        loading={loading}
        rows={pageRows}
        rowKey={(r) => r.id}
        emptyText="No admissions found"
        columns={columns}
        hoverable
        rowClassName={(r) =>
          isConfirmed(r)
            ? "bg-green-50/70 hover:bg-green-100/60 dark:bg-green-500/5 dark:hover:bg-green-500/10"
            : undefined
        }
      />

      <AdmissionDetailsDialog
        canEdit={canEdit}
        row={viewRow}
        pdfBusy={pdfId === viewRow?.id}
        onEdit={editRow}
        onPdf={downloadPdf}
        onToggleStatus={toggleStatus}
        onClose={() => setViewRow(null)}
      />

      <ConfirmDialog
        open={Boolean(deleteIds)}
        title="Delete admission?"
        message={
          deleteIds && deleteIds.length > 1
            ? `${deleteIds.length} admissions will be permanently deleted.`
            : "This admission will be permanently deleted."
        }
        onConfirm={() => deleteRows(deleteIds || [])}
        onClose={() => setDeleteIds(null)}
      />
    </TableCard>
  );
}
