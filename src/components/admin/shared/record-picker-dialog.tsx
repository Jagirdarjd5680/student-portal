"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useApi, useDebounce } from "@/hooks/use-api";
import { ListSkeleton } from "./skeletons";
import { SearchIcon, UserIcon } from "@/icons";
import { cn } from "@/utils";
import { useState } from "react";

export interface PickerRow {
  id: number;
  title: string;
  subtitle?: string;
  meta?: string;
  photo?: string;
  badge?: { label: string; color: "success" | "warning" | "light" };
}

interface RecordPickerDialogProps<T> {
  open: boolean;
  title: string;
  searchPlaceholder?: string;
  useLabel?: string;
  load: (search: string) => Promise<T[]>;
  toRow: (item: T) => PickerRow;
  onUse: (item: T) => void;
  onClose: () => void;
}

// Searchable list in a modal: click a row to select it, then "Use".
export default function RecordPickerDialog<T>({
  open,
  title,
  searchPlaceholder = "Search...",
  useLabel = "Use",
  load,
  toRow,
  onUse,
  onClose,
}: RecordPickerDialogProps<T>) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const q = useDebounce(search, 300);
  const { data, loading, error } = useApi(() => load(q), [q, open], {
    enabled: open,
  });
  const items = (data || []).slice(0, 100);
  const selected = items.find((i) => toRow(i).id === selectedId) || null;

  const close = () => {
    setSearch("");
    setSelectedId(null);
    onClose();
  };
  const use = (item: T | null) => {
    if (!item) return;
    onUse(item);
    close();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <InputGroup className="h-11">
          <InputGroupAddon align="inline-start">
            <SearchIcon className="size-5 text-gray-400" />
          </InputGroupAddon>
          <InputGroupInput
            autoFocus
            value={search}
            placeholder={searchPlaceholder}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedId(null);
            }}
          />
        </InputGroup>

        <div className="-mx-1 custom-scrollbar min-h-48 flex-1 overflow-y-auto px-1">
          {loading ? (
            <ListSkeleton rows={6} className="py-2" />
          ) : error ? (
            <p className="py-12 text-center text-sm text-red-500">{error}</p>
          ) : items.length === 0 ? (
            <p className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
              No records found
            </p>
          ) : (
            <ul className="space-y-1.5" role="listbox" aria-label={title}>
              {items.map((item) => {
                const r = toRow(item);
                const active = r.id === selectedId;
                return (
                  <li key={r.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => setSelectedId(r.id)}
                      onDoubleClick={() => use(item)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-start transition-colors",
                        active
                          ? "border-brand-500 bg-brand-50 dark:border-brand-400 dark:bg-brand-500/10"
                          : "border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/3",
                      )}
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 dark:bg-white/5">
                        {r.photo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={r.photo}
                            alt=""
                            className="size-full object-cover"
                          />
                        ) : (
                          <UserIcon className="size-5 text-gray-400" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-gray-800 dark:text-white/90">
                          {r.title}
                        </span>
                        {r.subtitle && (
                          <span className="block truncate text-xs text-gray-500 dark:text-gray-400">
                            {r.subtitle}
                          </span>
                        )}
                      </span>
                      <span className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
                        {r.badge && (
                          <Badge size="sm" color={r.badge.color}>
                            {r.badge.label}
                          </Badge>
                        )}
                        {r.meta && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {r.meta}
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <DialogFooter className="mx-0 mb-0 items-center p-0">
          <p className="me-auto text-xs text-gray-500 dark:text-gray-400">
            {selected
              ? `Selected: ${toRow(selected).title}`
              : "Click a row to select it"}
          </p>
          <Button variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button disabled={!selected} onClick={() => use(selected)}>
            {useLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
