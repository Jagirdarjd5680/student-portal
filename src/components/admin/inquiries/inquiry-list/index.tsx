"use client";

import { toast } from "sonner";
import { useCan } from "@/hooks/use-can";
import ConfirmDialog from "@/components/admin/shared/confirm-dialog";
import DataTable from "@/components/admin/shared/data-table";
import SelectBox from "@/components/admin/shared/select-field";
import TableCard from "@/components/admin/shared/table-card";
import TablePagination, {
  paginate,
} from "@/components/admin/shared/table-pagination";
import {
  useCourses,
  useReceptionists,
} from "@/components/admin/shared/use-lookups";
import { Button } from "@/components/ui/button";
import { INQUIRY_SOURCE_OPTIONS } from "@/data/options";
import { useApi, useDebounce } from "@/hooks/use-api";
import { Link, useRouter } from "@/i18n/navigation";
import { PlusIcon } from "@/icons";
import { exportExcel } from "@/lib/export";
import { errorMessage, todaySql } from "@/lib/format";
import { downloadTablePdf } from "@/lib/pdf";
import { inquiryService } from "@/services";
import type { Inquiry } from "@/types";
import { useMemo, useState } from "react";
import { INQUIRY_EXPORT_COLUMNS } from "../export-columns";
import { downloadInquiryPdf } from "../inquiry-pdf";
import BulkBar from "@/components/admin/shared/bulk-bar";
import { inquiryColumns } from "./columns";
import InquiryDetailsDialog from "./details-dialog";
import { CONFIRMED, isConfirmed, STATUS_OPTIONS } from "./utils";

interface InquiryListProps {
  status?: "Pending";
  title: string;
}

const EMPTY_FILTERS = {
  status: "",
  course_id: "",
  source: "",
  receptionist_id: "",
};

export default function InquiryList({ status, title }: InquiryListProps) {
  const router = useRouter();
  const can = useCan();
  const canAdd = can("inquiries", "add");
  const canEdit = can("inquiries", "edit");
  const canDelete = can("inquiries", "delete");
  const { courseOptions } = useCourses();
  const receptionistOptions = useReceptionists({ includeInactive: true });
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [busyIds, setBusyIds] = useState<Set<number>>(new Set());
  const [viewRow, setViewRow] = useState<Inquiry | null>(null);
  const [deleteIds, setDeleteIds] = useState<number[] | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pdfId, setPdfId] = useState<number | null>(null);
  const q = useDebounce(search);

  const query = { search: q, ...filters, status: status || filters.status };
  const { data, loading, error, setData } = useApi(
    () => inquiryService.list(query),
    [q, status, filters],
  );
  const { data: institute } = useApi(() => inquiryService.institute(), []);
  const rows = useMemo(() => data || [], [data]);
  const pageRows = paginate(rows, page, pageSize);
  const selectedRows = rows.filter((r) => selected.has(r.id));

  const downloadPdf = async (row: Inquiry) => {
    setActionError(null);
    setPdfId(row.id);
    try {
      await downloadInquiryPdf(row, institute);
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setPdfId(null);
    }
  };

  const setBusy = (ids: number[], on: boolean) =>
    setBusyIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => (on ? next.add(id) : next.delete(id)));
      return next;
    });

  // Update status on the server, then patch local rows (no full reload / spinner).
  const changeStatus = async (ids: number[], confirmed: boolean) => {
    const newStatus: Inquiry["status"] = confirmed ? CONFIRMED : "Pending";
    const keepOnly = status || filters.status;
    setActionError(null);
    setBusy(ids, true);
    try {
      await Promise.all(
        ids.map((id) => inquiryService.setStatus(id, newStatus)),
      );
      setData((prev) =>
        (prev || [])
          .map((r) => (ids.includes(r.id) ? { ...r, status: newStatus } : r))
          // When the list is filtered by status, rows that no longer match drop out.
          .filter((r) => !keepOnly || r.status === keepOnly),
      );
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setBusy(ids, false);
    }
  };

  const deleteRows = async (ids: number[]) => {
    setActionError(null);
    try {
      await Promise.all(ids.map((id) => inquiryService.remove(id)));
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

  const editRow = (row: Inquiry) => router.push(`/inquiries/${row.id}/edit`);

  const columns = inquiryColumns({
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
    onToggleStatus: (row, confirmed) => changeStatus([row.id], confirmed),
    onView: setViewRow,
    onPdf: downloadPdf,
    onEdit: editRow,
    onDelete: (row) => setDeleteIds([row.id]),
  });

  const setFilter = (key: keyof typeof EMPTY_FILTERS) => (v: string) => {
    setFilters((f) => ({ ...f, [key]: v }));
    setPage(1);
  };
  const exportName = `inquiries-${todaySql()}`;

  return (
    <TableCard
      title={title}
      search={search}
      onSearchChange={(v) => {
        setSearch(v);
        setPage(1);
      }}
      searchPlaceholder="Search Name, Email, Phone, Form No"
      actions={
        canAdd ? (
          <Button nativeButton={false} render={<Link href="/inquiries/add" />}>
            <PlusIcon /> Add Inquiry
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
          <SelectBox
            size="sm"
            options={INQUIRY_SOURCE_OPTIONS}
            value={filters.source}
            onChange={setFilter("source")}
            placeholder="All Sources"
          />
          <SelectBox
            size="sm"
            options={receptionistOptions}
            value={filters.receptionist_id}
            onChange={setFilter("receptionist_id")}
            placeholder="All Receptionists"
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
          exportExcel(selectedRows, INQUIRY_EXPORT_COLUMNS, exportName)
        }
        onPdf={() =>
          downloadTablePdf(selectedRows, INQUIRY_EXPORT_COLUMNS, {
            title: "Inquiry List",
            subtitle: [`Total: ${selectedRows.length}`],
            fileName: exportName,
            institute: institute?.name,
          }).catch((err) => setActionError(errorMessage(err)))
        }
        onConfirm={() =>
          changeStatus(
            selectedRows.map((r) => r.id),
            true,
          )
        }
        onPending={() =>
          changeStatus(
            selectedRows.map((r) => r.id),
            false,
          )
        }
        onDelete={() => setDeleteIds(selectedRows.map((r) => r.id))}
        onClear={() => setSelected(new Set())}
      />

      <DataTable
        loading={loading}
        rows={pageRows}
        rowKey={(r) => r.id}
        emptyText="No inquiries found"
        columns={columns}
        hoverable
        rowClassName={(r) =>
          isConfirmed(r)
            ? "bg-green-50/70 hover:bg-green-100/60 dark:bg-green-500/5 dark:hover:bg-green-500/10"
            : undefined
        }
      />

      <InquiryDetailsDialog
        canEdit={canEdit}
        row={viewRow}
        pdfBusy={pdfId === viewRow?.id}
        onEdit={editRow}
        onPdf={downloadPdf}
        onClose={() => setViewRow(null)}
      />

      <ConfirmDialog
        open={Boolean(deleteIds)}
        title="Delete inquiry?"
        message={
          deleteIds && deleteIds.length > 1
            ? `${deleteIds.length} inquiries will be permanently deleted.`
            : "This inquiry will be permanently deleted."
        }
        onConfirm={() => deleteRows(deleteIds || [])}
        onClose={() => setDeleteIds(null)}
      />
    </TableCard>
  );
}
