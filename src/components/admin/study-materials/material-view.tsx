"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { fileUrl } from "@/lib/config";
import type { StudyMaterial } from "@/types";

interface MaterialViewProps {
  material: StudyMaterial | null;
  onClose: () => void;
}

const isImage = (name: string) => /\.(jpe?g|png|gif|webp)$/i.test(name);

export default function MaterialView({ material, onClose }: MaterialViewProps) {
  const url = fileUrl(material?.file_path);

  return (
    <Dialog open={Boolean(material)} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{material?.title}</DialogTitle>
          <DialogDescription>
            {material?.topic} · {material?.material_type}
          </DialogDescription>
        </DialogHeader>

        {material?.content && (
          <p className="text-sm whitespace-pre-line text-gray-700 dark:text-gray-300">
            {material.content}
          </p>
        )}
        {material?.file_path && isImage(material.file_path) && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={material.title}
            className="max-h-96 w-full rounded-xl object-contain"
          />
        )}

        <DialogFooter className="mx-0 mb-0 p-0">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {material?.file_path && (
            <Button
              nativeButton={false}
              render={<a href={url} target="_blank" rel="noreferrer" />}
            >
              Open File
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
