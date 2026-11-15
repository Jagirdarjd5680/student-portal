"use client";

import { Bone, ListSkeleton } from "@/components/admin/shared/skeletons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useApi } from "@/hooks/use-api";
import { Link } from "@/i18n/navigation";
import { DollarIcon, UserIcon } from "@/icons";
import { fileUrl } from "@/lib/config";
import { formatCurrency, formatDate } from "@/lib/format";
import { studentService } from "@/services";
import { cn } from "@/utils";

interface StudentFeePanelProps {
  studentId: string;
  /** Amount typed in the form, for the "after this payment" preview. */
  amount: string;
  /** Bump to reload after a payment is saved. */
  refreshKey: number;
  onPickAmount: (amount: string) => void;
}

const panel =
  "rounded-2xl border border-gray-200 bg-gray-50/60 p-5 dark:border-gray-800 dark:bg-white/3";

function Row({
  label,
  value,
  tone,
  strong,
}: {
  label: string;
  value: string;
  tone?: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 text-sm">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span
        className={cn(
          strong ? "font-semibold" : "font-medium",
          tone || "text-gray-800 dark:text-white/90",
        )}
      >
        {value}
      </span>
    </div>
  );
}

// Fee summary of the selected student: course, fee breakdown, progress,
// "after this payment" preview and payment history.
export default function StudentFeePanel({
  studentId,
  amount,
  refreshKey,
  onPickAmount,
}: StudentFeePanelProps) {
  const {
    data: s,
    loading,
    error,
  } = useApi(() => studentService.get(studentId), [studentId, refreshKey], {
    enabled: Boolean(studentId),
  });

  if (!studentId) {
    return (
      <div
        className={cn(
          panel,
          "flex flex-col items-center justify-center gap-2 py-12 text-center",
        )}
      >
        <span className="flex size-12 items-center justify-center rounded-full bg-white text-gray-400 dark:bg-white/5">
          <DollarIcon className="size-6" />
        </span>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          No student selected
        </p>
        <p className="max-w-60 text-xs text-gray-500 dark:text-gray-400">
          Select a student to see their course, fee details and payment history.
        </p>
      </div>
    );
  }

  if (loading && !s) {
    return (
      <div
        className={cn(panel, "space-y-5")}
        aria-busy
        aria-label="Loading fee details"
      >
        <div className="flex items-center gap-3">
          <Bone className="size-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Bone className="h-4 w-2/3" />
            <Bone className="h-3 w-1/3" />
          </div>
        </div>
        <Bone className="h-24 w-full rounded-xl" />
        <ListSkeleton rows={3} />
      </div>
    );
  }

  if (error || !s) {
    return (
      <div className={cn(panel, "text-sm text-red-500")}>
        {error || "Student not found"}
      </div>
    );
  }

  const net = Number(s.total_fee) || 0;
  const paid = Number(s.total_paid) || 0;
  const balance = Math.max(0, Number(s.balance) || 0);
  const pct = net ? Math.min(100, Math.round((paid / net) * 100)) : 100;
  const typed = Number(amount) || 0;
  const after = balance - typed;
  const discountLabel =
    Number(s.discount_amount) > 0
      ? s.discount_type === "percentage"
        ? `-${formatCurrency(s.discount_amount)} (${Number(s.discount_value)}%)`
        : `-${formatCurrency(s.discount_amount)}`
      : formatCurrency(0);
  const half = Math.round((balance / 2) * 100) / 100;

  return (
    <div className={cn(panel, "space-y-5")}>
      {/* Who */}
      <div className="flex items-center gap-3">
        <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white dark:bg-white/5">
          {s.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={fileUrl(s.photo)}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            <UserIcon className="size-6 text-gray-400" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <Link
            href={`/students/${s.id}`}
            className="block truncate font-semibold text-gray-800 hover:text-brand-500 dark:text-white/90"
          >
            {s.full_name}
          </Link>
          <p className="truncate text-xs text-gray-500 dark:text-gray-400">
            {s.student_code}
            {s.phone ? ` · ${s.phone}` : ""}
          </p>
        </div>
        <Badge
          size="sm"
          color={balance <= 0 ? "success" : paid > 0 ? "warning" : "error"}
        >
          {balance <= 0 ? "Paid" : paid > 0 ? "Partial" : "Unpaid"}
        </Badge>
      </div>

      {/* Course */}
      <div className="rounded-xl bg-white p-4 dark:bg-white/3">
        <p className="text-xs text-gray-500 dark:text-gray-400">Course</p>
        <p className="mt-0.5 font-semibold text-gray-800 dark:text-white/90">
          {s.course_name || "No course"}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {[
            s.duration_name,
            s.admission_date && `Joined ${formatDate(s.admission_date)}`,
          ]
            .filter(Boolean)
            .join(" · ") || "-"}
        </p>
      </div>

      {/* Fee breakdown */}
      <div className="rounded-xl bg-white px-4 py-2 dark:bg-white/3">
        <Row label="Total Fee" value={formatCurrency(s.course_fee)} />
        <Row
          label="Discount"
          value={discountLabel}
          tone="text-orange-500 dark:text-orange-400"
        />
        <div className="border-t border-dashed border-gray-200 dark:border-gray-700">
          <Row label="Net Fee" value={formatCurrency(net)} strong />
        </div>
        <Row
          label="Paid"
          value={formatCurrency(paid)}
          tone="text-green-600 dark:text-green-500"
        />
        <div className="border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between gap-3 py-3">
            <span className="text-sm font-semibold text-gray-800 dark:text-white/90">
              Remaining Balance
            </span>
            <span
              className={cn(
                "text-lg font-bold",
                balance > 0
                  ? "text-red-500 dark:text-red-400"
                  : "text-green-600 dark:text-green-500",
              )}
            >
              {formatCurrency(balance)}
            </span>
          </div>
        </div>
        <div className="pb-3">
          <div className="mb-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{pct}% paid</span>
            <span>{100 - pct}% left</span>
          </div>
          <div
            className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${pct}% of fee paid`}
          >
            <div
              className="h-full rounded-full bg-green-500 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick amounts + live preview */}
      {balance > 0 && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="xs"
              variant="outline"
              onClick={() => onPickAmount(String(balance))}
            >
              Full balance · {formatCurrency(balance)}
            </Button>
            {half > 0 && half < balance && (
              <Button
                type="button"
                size="xs"
                variant="outline"
                onClick={() => onPickAmount(String(half))}
              >
                Half · {formatCurrency(half)}
              </Button>
            )}
          </div>
          {typed > 0 && (
            <div
              className={cn(
                "rounded-xl border px-4 py-3 text-sm",
                after < 0
                  ? "border-red-200 bg-red-50 text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
                  : "border-brand-100 bg-brand-50 text-gray-700 dark:border-brand-500/20 dark:bg-brand-500/10 dark:text-gray-300",
              )}
            >
              {after < 0 ? (
                <>
                  Amount is {formatCurrency(-after)} more than the remaining
                  balance.
                </>
              ) : (
                <>
                  After this payment of <strong>{formatCurrency(typed)}</strong>
                  , balance will be <strong>{formatCurrency(after)}</strong>
                  {after === 0 && " — fully paid 🎉"}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* History */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
            Payment History
          </h4>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {s.payments.length}{" "}
            {s.payments.length === 1 ? "payment" : "payments"}
          </span>
        </div>
        {s.payments.length === 0 ? (
          <p className="rounded-xl bg-white px-4 py-6 text-center text-sm text-gray-500 dark:bg-white/3 dark:text-gray-400">
            No payments yet
          </p>
        ) : (
          <ol className="custom-scrollbar max-h-64 space-y-0 overflow-y-auto">
            {s.payments.map((p, i) => (
              <li key={p.id} className="relative flex gap-3 ps-1 pb-3">
                {/* timeline line + dot */}
                {i < s.payments.length - 1 && (
                  <span
                    className="absolute start-3 top-5 bottom-0 w-px bg-gray-200 dark:bg-gray-700"
                    aria-hidden
                  />
                )}
                <span className="relative mt-1.5 size-4 shrink-0 rounded-full border-2 border-green-500 bg-white dark:bg-gray-900" />
                <div className="min-w-0 flex-1 rounded-xl bg-white px-3 py-2 dark:bg-white/3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-gray-800 dark:text-white/90">
                      {formatCurrency(p.amount)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(p.payment_date)}
                    </span>
                  </div>
                  <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                    {[p.method, p.invoice_no, p.description]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
