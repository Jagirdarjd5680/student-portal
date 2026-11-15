"use client";

import ComponentCard from "@/components/common/component-card";
import FormAlert from "@/components/admin/shared/form-alert";
import { ListSkeleton } from "@/components/admin/shared/skeletons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useApi } from "@/hooks/use-api";
import { DocIcon, FileImgIcon, FilePdfIcon } from "@/icons";
import { fileUrl } from "@/lib/config";
import { formatDate } from "@/lib/format";
import { studentPortalService } from "@/services";
import type { PortalMaterial } from "@/types";
import { useMemo, useState } from "react";

const TYPE_ICON = {
  "PDF Document": <FilePdfIcon className="size-5" />,
  Image: <FileImgIcon className="size-5" />,
  "Text Content": <DocIcon className="size-5" />,
} as const;

// Study materials of the student's course, grouped by topic.
export default function StudentMaterials() {
  const { data, loading, error } = useApi(() =>
    studentPortalService.materials(),
  );
  const [reading, setReading] = useState<PortalMaterial | null>(null);

  const topics = useMemo(() => {
    const map = new Map<string, PortalMaterial[]>();
    (data || []).forEach((m) =>
      map.set(m.topic, [...(map.get(m.topic) || []), m]),
    );
    return [...map.entries()];
  }, [data]);

  if (loading && !data) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[0, 1].map((i) => (
          <ComponentCard key={i} title="Loading...">
            <ListSkeleton rows={3} />
          </ComponentCard>
        ))}
      </div>
    );
  }
  if (error) return <FormAlert type="error" message={error} />;
  if (!topics.length) {
    return (
      <ComponentCard title="Study Materials">
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <DocIcon className="size-12 text-gray-400" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No study materials uploaded yet.
          </p>
        </div>
      </ComponentCard>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {topics.map(([topic, items]) => (
          <ComponentCard
            key={topic}
            title={topic}
            desc={`${items.length} ${items.length === 1 ? "item" : "items"}`}
          >
            <ul className="-my-3 divide-y divide-gray-100 dark:divide-gray-800">
              {items.map((m) => (
                <li key={m.id} className="flex items-center gap-3 py-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-500 dark:bg-brand-500/15">
                    {TYPE_ICON[m.material_type]}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-gray-800 dark:text-white/90">
                      {m.title}
                    </span>
                    <span className="mt-0.5 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <Badge size="sm" color="light">
                        {m.material_type}
                      </Badge>
                      {formatDate(m.created_at)}
                    </span>
                  </span>
                  {m.file_path ? (
                    <Button
                      size="xs"
                      variant="outline"
                      nativeButton={false}
                      render={
                        <a
                          href={fileUrl(m.file_path)}
                          target="_blank"
                          rel="noreferrer"
                        />
                      }
                    >
                      Open
                    </Button>
                  ) : (
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => setReading(m)}
                    >
                      Read
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </ComponentCard>
        ))}
      </div>

      <Dialog
        open={Boolean(reading)}
        onOpenChange={(o) => !o && setReading(null)}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{reading?.title}</DialogTitle>
          </DialogHeader>
          <p className="text-sm whitespace-pre-line text-gray-700 dark:text-gray-300">
            {reading?.content || "No content."}
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
