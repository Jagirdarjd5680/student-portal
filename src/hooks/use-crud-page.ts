"use client";

import { errorMessage } from "@/lib/format";
import { useState } from "react";
import { toast } from "sonner";

// Common state for list pages with an add/edit dialog and a delete confirm.
export function useCrudPage<T extends { id: number }>(
  removeFn: (id: number) => Promise<unknown>,
  reload: () => Promise<void>,
) {
  const [editing, setEditing] = useState<T | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);

  return {
    editing,
    formOpen,
    deleting,
    error,
    openAdd: () => {
      setEditing(null);
      setFormOpen(true);
    },
    openEdit: (row: T) => {
      setEditing(row);
      setFormOpen(true);
    },
    closeForm: () => setFormOpen(false),
    askDelete: (row: T) => setDeleting(row),
    cancelDelete: () => setDeleting(null),
    confirmDelete: async () => {
      if (!deleting) return;
      setError(null);
      try {
        await removeFn(deleting.id);
        setDeleting(null);
        toast.success("Deleted successfully");
        await reload();
      } catch (err) {
        setDeleting(null);
        setError(errorMessage(err));
      }
    },
    onSaved: async () => {
      toast.success("Saved successfully");
      setFormOpen(false);
      await reload();
    },
  };
}
