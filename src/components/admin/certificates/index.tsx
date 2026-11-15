"use client";

import ComponentCard from "@/components/common/component-card";
import ConfirmDialog from "@/components/admin/shared/confirm-dialog";
import DataTable from "@/components/admin/shared/data-table";
import FormAlert from "@/components/admin/shared/form-alert";
import FormDialog from "@/components/admin/shared/form-dialog";
import TableCard from "@/components/admin/shared/table-card";
import TablePagination, {
  paginate,
} from "@/components/admin/shared/table-pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useApi, useDebounce } from "@/hooks/use-api";
import { useCan } from "@/hooks/use-can";
import {
  DownloadIcon,
  EyeIcon,
  FileImgIcon,
  FilePdfIcon,
  PencilIcon,
  TrashBinIcon,
} from "@/icons";
import { toFormData } from "@/lib/api-client";
import { errorMessage, formatDate } from "@/lib/format";
import { openProtectedFile } from "@/lib/protected-file";
import { certificateService, studentService } from "@/services";
import type { Certificate, Option } from "@/types";
import { useMemo, useState } from "react";
import CertificateFields, {
  validateCertificate,
  type CertificateErrors,
  type CertificateForm,
} from "./certificate-fields";

const EMPTY: CertificateForm = { student_id: "", title: "", code: "" };

function useStudentOptions(): Option[] {
  const { data } = useApi(() => studentService.list());
  return useMemo(
    () =>
      (data || []).map((s) => ({
        value: String(s.id),
        label: `${s.full_name} (${s.student_code})`,
      })),
    [data],
  );
}

// Issue form (card on top) + list of issued certificates.
export default function Certificates() {
  const can = useCan();
  const canAdd = can("certificates", "add");
  const canEdit = can("certificates", "edit");
  const canDelete = can("certificates", "delete");
  const studentOptions = useStudentOptions();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const q = useDebounce(search);
  const { data, loading, error, reload } = useApi(
    () => certificateService.list({ search: q }),
    [q],
  );
  const rows = data || [];

  // ── issue ──
  const [form, setForm] = useState(EMPTY);
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<CertificateErrors>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [resetKey, setResetKey] = useState(0);

  const issue = async (e: React.FormEvent) => {
    e.preventDefault();
    const next = validateCertificate(form, file, true);
    setErrors(next);
    if (Object.keys(next).length) return;
    setSaving(true);
    setMessage(null);
    try {
      await certificateService.create(toFormData({ ...form }, { file }));
      setMessage({
        type: "success",
        text: "Certificate issued. The student can see it in My Certificates.",
      });
      setForm(EMPTY);
      setFile(null);
      setResetKey((k) => k + 1);
      await reload();
    } catch (err) {
      setMessage({ type: "error", text: errorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  // ── edit ──
  const [editing, setEditing] = useState<Certificate | null>(null);
  const [editForm, setEditForm] = useState(EMPTY);
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editErrors, setEditErrors] = useState<CertificateErrors>({});
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const openEdit = (c: Certificate) => {
    setEditing(c);
    setEditForm({
      student_id: String(c.student_id),
      title: c.title,
      code: c.code,
    });
    setEditFile(null);
    setEditErrors({});
    setEditError(null);
  };
  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const next = validateCertificate(editForm, editFile, false);
    setEditErrors(next);
    if (Object.keys(next).length) return;
    setEditSaving(true);
    setEditError(null);
    try {
      await certificateService.update(
        editing.id,
        toFormData({ ...editForm }, { file: editFile }),
      );
      setEditing(null);
      await reload();
    } catch (err) {
      setEditError(errorMessage(err));
    } finally {
      setEditSaving(false);
    }
  };

  // ── delete / open ──
  const [deleting, setDeleting] = useState<Certificate | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [busyFile, setBusyFile] = useState<string | null>(null);

  const showFile = async (c: Certificate, download: boolean) => {
    const key = `${c.id}-${download ? "d" : "v"}`;
    setBusyFile(key);
    setFileError(null);
    try {
      await openProtectedFile(`/certificates/${c.id}/file`, {
        download,
        name: c.original_name || `${c.code}`,
      });
    } catch (err) {
      setFileError(errorMessage(err));
    } finally {
      setBusyFile(null);
    }
  };

  return (
    <div className="space-y-6">
      {canAdd && (
        <ComponentCard title="Issue Certificate">
          <form onSubmit={issue} noValidate className="space-y-6">
            <FormAlert
              type={message?.type ?? "success"}
              message={message?.text}
            />
            <CertificateFields
              form={form}
              errors={errors}
              studentOptions={studentOptions}
              resetKey={resetKey}
              onChange={(k, v) => setForm((f) => ({ ...f, [k]: v }))}
              onFile={setFile}
            />
            <div className="flex justify-end">
              <Button type="submit" loading={saving}>
                {saving ? "Uploading..." : "Issue Certificate"}
              </Button>
            </div>
          </form>
        </ComponentCard>
      )}

      <TableCard
        title="Issued Certificates"
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Search code, title, student"
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
        {(error || fileError) && (
          <p className="px-6 pb-3 text-sm text-red-500">{error || fileError}</p>
        )}
        <DataTable
          loading={loading}
          rows={paginate(rows, page, pageSize)}
          rowKey={(r) => r.id}
          emptyText="No certificates issued yet"
          hoverable
          columns={[
            {
              header: "Code",
              cell: (r) => (
                <Badge size="sm" color="primary">
                  {r.code}
                </Badge>
              ),
            },
            {
              header: "Certificate",
              cell: (r) => (
                <div className="flex items-center gap-2">
                  <span className="text-brand-500">
                    {r.file_kind === "pdf" ? (
                      <FilePdfIcon className="size-5" />
                    ) : (
                      <FileImgIcon className="size-5" />
                    )}
                  </span>
                  <span className="font-semibold text-gray-800 dark:text-white/90">
                    {r.title}
                  </span>
                </div>
              ),
            },
            {
              header: "Student",
              cell: (r) => (
                <>
                  <p className="font-medium text-gray-800 dark:text-white/90">
                    {r.student_name}
                  </p>
                  <p className="text-xs">{r.student_code}</p>
                </>
              ),
            },
            {
              header: "Issued",
              className: "whitespace-nowrap",
              cell: (r) => formatDate(r.created_at),
            },
            {
              header: "Actions",
              cell: (r) => (
                <div className="flex items-center gap-1">
                  <Button
                    size="icon-xs"
                    variant="ghost"
                    title="View"
                    aria-label="View"
                    loading={busyFile === `${r.id}-v`}
                    onClick={() => showFile(r, false)}
                  >
                    <EyeIcon className="size-4 fill-current" />
                  </Button>
                  <Button
                    size="icon-xs"
                    variant="ghost"
                    title="Download"
                    aria-label="Download"
                    loading={busyFile === `${r.id}-d`}
                    onClick={() => showFile(r, true)}
                  >
                    <DownloadIcon className="size-4" />
                  </Button>
                  {canEdit && (
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      title="Edit"
                      aria-label="Edit"
                      onClick={() => openEdit(r)}
                    >
                      <PencilIcon className="size-4" />
                    </Button>
                  )}
                  {canDelete && (
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      title="Delete"
                      aria-label="Delete"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => setDeleting(r)}
                    >
                      <TrashBinIcon className="size-4" />
                    </Button>
                  )}
                </div>
              ),
            },
          ]}
        />
      </TableCard>

      <FormDialog
        open={Boolean(editing)}
        title="Edit Certificate"
        error={editError}
        submitting={editSaving}
        className="sm:max-w-2xl"
        onClose={() => setEditing(null)}
        onSubmit={saveEdit}
      >
        <CertificateFields
          form={editForm}
          errors={editErrors}
          studentOptions={studentOptions}
          currentFile={editing?.original_name || editing?.code}
          onChange={(k, v) => setEditForm((f) => ({ ...f, [k]: v }))}
          onFile={setEditFile}
        />
      </FormDialog>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete certificate?"
        message={`Certificate "${deleting?.code}" will be deleted and the file removed from the server.`}
        onConfirm={async () => {
          if (!deleting) return;
          try {
            await certificateService.remove(deleting.id);
            setDeleting(null);
            await reload();
          } catch (err) {
            setFileError(errorMessage(err));
            setDeleting(null);
          }
        }}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}
