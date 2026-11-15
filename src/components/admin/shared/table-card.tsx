"use client";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { SearchIcon } from "@/icons";

interface TableCardProps {
  title: string;
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  actions?: React.ReactNode;
  filters?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

// Card with title, search box and actions — same look as template tables.
export default function TableCard({
  title,
  search,
  onSearchChange,
  searchPlaceholder = "Search...",
  actions,
  filters,
  children,
  footer,
}: TableCardProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
      <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {title}
        </h3>
        <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
          {onSearchChange && (
            <InputGroup className="h-10 flex-1 sm:w-75 sm:flex-initial">
              <InputGroupAddon align="inline-start">
                <SearchIcon className="size-5 text-gray-400" />
              </InputGroupAddon>
              <InputGroupInput
                type="text"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </InputGroup>
          )}
          {actions}
        </div>
      </div>
      {filters && <div className="px-5 pb-4 sm:px-6">{filters}</div>}
      {children}
      {footer}
    </div>
  );
}
