"use client";

import ComponentCard from "@/components/common/component-card";
import FormAlert from "@/components/admin/shared/form-alert";
import { ListSkeleton } from "@/components/admin/shared/skeletons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useApi } from "@/hooks/use-api";
import {
  DownloadIcon,
  EyeIcon,
  FileImgIcon,
  FilePdfIcon,
  StarIcon,
} from "@/icons";
import { errorMessage, formatDate } from "@/lib/format";
import { openProtectedFile } from "@/lib/protected-file";
import { studentPortalService } from "@/services";
import { useState } from "react";

// The student's own certificates: view in a new tab or download.
export default function StudentCertificates() {
  const { data, loading, error } = useApi(() =>
    studentPortalService.certificates(),
  );
  const [busy, setBusy] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const open = async (id: number, name: string, download: boolean) => {
    setBusy(`${id}-${download ? "d" : "v"}`);
    setFileError(null);
    try {
      await openProtectedFile(`/student/certificates/${id}/file`, {
        download,
        name,
      });
    } catch (err) {
      setFileError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  if (loading && !data) {
    return (
      <ComponentCard title="My Certificates">
        <ListSkeleton rows={3} />
      </ComponentCard>
    );
  }
  if (error) return <FormAlert type="error" message={error} />;
  if (!data?.length) {
    return (
      <ComponentCard title="My Certificates">
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <StarIcon className="size-12 text-gray-400" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No certificates issued to you yet.
          </p>
        </div>
      </ComponentCard>
    );
  }

  return (
    <div className="space-y-4">
      <FormAlert type="error" message={fileError} />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {data.map((c) => (
          <div
            key={c.id}
            className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3"
          >
            <div className="flex items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-500 dark:bg-brand-500/15">
                {c.file_kind === "pdf" ? (
                  <FilePdfIcon className="size-6" />
                ) : (
                  <FileImgIcon className="size-6" />
                )}
              </span>
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-800 dark:text-white/90">
                  {c.title}
                </h3>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Issued {formatDate(c.created_at)}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 rounded-lg bg-gray-50 px-3 py-2 dark:bg-white/5">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Certificate Code
              </span>
              <Badge size="sm" color="primary">
                {c.code}
              </Badge>
            </div>
            <div className="mt-auto flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                loading={busy === `${c.id}-v`}
                onClick={() => open(c.id, c.original_name || c.code, false)}
              >
                {busy !== `${c.id}-v` && (
                  <EyeIcon className="size-4 fill-current" />
                )}{" "}
                View
              </Button>
              <Button
                className="flex-1"
                loading={busy === `${c.id}-d`}
                onClick={() => open(c.id, c.original_name || c.code, true)}
              >
                {busy !== `${c.id}-d` && <DownloadIcon className="size-4" />}{" "}
                Download
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
