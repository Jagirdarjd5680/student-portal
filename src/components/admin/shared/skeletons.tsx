import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/utils";

// Skeleton building blocks shared by every admin page.
// They mirror the real layout so content doesn't jump when data arrives.

/** One grey placeholder block. */
export function Bone({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <Skeleton
      className={cn("bg-gray-200 dark:bg-white/10", className)}
      style={style}
    />
  );
}

const card =
  "rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3";

/** Body rows for DataTable while loading. */
export function TableRowsSkeleton({
  columns,
  rows = 6,
}: {
  columns: number;
  rows?: number;
}) {
  return (
    <>
      {Array.from({ length: rows }, (_, r) => (
        <TableRow key={r} aria-hidden>
          {Array.from({ length: columns }, (_, c) => (
            <TableCell key={c} className="px-4 py-3.5">
              {c === 0 && columns > 3 ? (
                <Bone className="size-4" />
              ) : (
                <div className="space-y-1.5">
                  <Bone
                    className={cn(
                      "h-3.5",
                      c % 3 === 1 ? "w-28" : c % 3 === 2 ? "w-20" : "w-24",
                    )}
                  />
                  {c % 2 === 1 && <Bone className="h-2.5 w-16" />}
                </div>
              )}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

/** Same shape as a MetricCard. */
export function MetricCardSkeleton() {
  return (
    <div className={cn(card, "p-5 md:p-6")} aria-hidden>
      <Bone className="size-12 rounded-xl" />
      <Bone className="mt-5 h-3.5 w-24" />
      <Bone className="mt-3 h-7 w-32" />
    </div>
  );
}

/** Bars of varying height, sized like a chart body. */
export function ChartBodySkeleton({ height = 260 }: { height?: number }) {
  const bars = [45, 70, 35, 85, 55, 65, 40, 75, 50, 60];
  return (
    <div className="flex items-end gap-3 px-2" style={{ height }} aria-hidden>
      {bars.map((h, i) => (
        <Bone
          key={i}
          className="flex-1 rounded-t-md rounded-b-none"
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}

/** Full chart card: title + body. */
export function ChartCardSkeleton({
  height = 260,
  className,
}: {
  height?: number;
  className?: string;
}) {
  return (
    <div className={cn(card, "p-5 sm:p-6", className)} aria-hidden>
      <Bone className="h-5 w-40" />
      <Bone className="mt-2 h-3 w-56" />
      <div className="mt-6">
        <ChartBodySkeleton height={height} />
      </div>
    </div>
  );
}

/** Avatar + two lines, repeated (activity feeds, pickers). */
export function ListSkeleton({
  rows = 6,
  className,
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <ul className={cn("space-y-3", className)} aria-hidden>
      {Array.from({ length: rows }, (_, i) => (
        <li key={i} className="flex items-center gap-3">
          <Bone className="size-10 shrink-0 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Bone className="h-3.5 w-2/5" />
            <Bone className="h-3 w-3/5" />
          </div>
          <Bone className="h-3 w-14" />
        </li>
      ))}
    </ul>
  );
}

/** A form card with labelled inputs in a two-column grid (edit pages). */
export function FormSkeleton({ fields = 10 }: { fields?: number }) {
  return (
    <div className={card} aria-busy aria-label="Loading form">
      <div className="border-b border-gray-100 px-6 py-5 dark:border-gray-800">
        <Bone className="h-5 w-48" />
      </div>
      <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
        {Array.from({ length: fields }, (_, i) => (
          <div key={i} className={cn("space-y-2", i === 4 && "md:col-span-2")}>
            <Bone className="h-3.5 w-28" />
            <Bone
              className={cn("w-full rounded-[10px]", i === 4 ? "h-20" : "h-11")}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-3 px-6 pb-6">
        <Bone className="h-11 w-24 rounded-lg" />
        <Bone className="h-11 w-36 rounded-lg" />
      </div>
    </div>
  );
}

/** Student profile page: profile card, 4 metrics, payments table. */
export function ProfilePageSkeleton() {
  return (
    <div className="space-y-6" aria-busy aria-label="Loading">
      <div className="flex justify-end gap-3">
        <Bone className="h-11 w-32 rounded-lg" />
        <Bone className="h-11 w-36 rounded-lg" />
      </div>
      <div
        className={cn(
          card,
          "flex flex-col gap-5 p-6 sm:flex-row sm:items-center",
        )}
      >
        <Bone className="size-20 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2.5">
          <Bone className="h-6 w-48" />
          <Bone className="h-3.5 w-64" />
          <Bone className="h-3.5 w-40" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>
      <div className={cn(card, "p-6")}>
        <Bone className="mb-5 h-5 w-40" />
        <ListSkeleton rows={4} />
      </div>
    </div>
  );
}
