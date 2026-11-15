"use client";

import ComponentCard from "@/components/common/component-card";
import { ListSkeleton } from "@/components/admin/shared/skeletons";
import { Button } from "@/components/ui/button";
import { useApi } from "@/hooks/use-api";
import { Link } from "@/i18n/navigation";
import { DocIcon, FilePdfIcon, UserIcon } from "@/icons";
import { fileUrl } from "@/lib/config";
import { formatCurrency, formatDate } from "@/lib/format";
import { studentPortalService } from "@/services";
import { useStudent } from "./context";
import InfoRow from "./info-row";

// Welcome banner + three cards (course, fees, latest materials), each only if the student may open that menu.
export default function StudentDashboard() {
  const { me } = useStudent();
  const canMaterials = Boolean(me?.menus.includes("materials"));
  const { data: materials, loading: loadingMaterials } = useApi(
    () => studentPortalService.materials(),
    [canMaterials],
    { enabled: canMaterials },
  );

  if (!me) return null;
  const { student, course, fees } = me;
  const photo = fileUrl(student.photo);

  return (
    <div className="space-y-6">
      <div className="student-banner flex items-center gap-5 rounded-2xl p-6 shadow-theme-md sm:p-8">
        <span className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white text-brand-500">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="" className="size-full object-cover" />
          ) : (
            <UserIcon className="size-10" />
          )}
        </span>
        <div className="min-w-0">
          <h2 className="truncate text-2xl font-bold sm:text-3xl">
            Welcome back, {student.first_name}!
          </h2>
          <p className="mt-1 text-sm text-white/90">
            Student ID: {student.student_code}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {course && (
          <ComponentCard title="My Course">
            <div className="-my-3">
              <InfoRow label="Course Name" value={course.name} />
              <InfoRow label="Category" value={course.category} />
              <InfoRow label="Duration" value={course.duration} />
              <InfoRow
                label="Admission Date"
                value={
                  course.admission_date
                    ? formatDate(course.admission_date)
                    : "-"
                }
              />
            </div>
          </ComponentCard>
        )}

        {fees && (
          <ComponentCard title="Fee Status">
            <div className="-my-3">
              <InfoRow
                label="Total Fee"
                value={formatCurrency(fees.course_fee)}
              />
              <InfoRow
                label="Discount"
                value={`- ${formatCurrency(fees.discount_amount)}`}
              />
              <InfoRow
                label="Net Payable"
                value={formatCurrency(fees.total_fee)}
              />
              <InfoRow
                label="Total Paid"
                value={formatCurrency(fees.total_paid)}
              />
              <InfoRow
                label="Balance"
                value={formatCurrency(Math.max(0, fees.balance))}
                tone={
                  fees.balance > 0
                    ? "text-brand-500 dark:text-brand-400"
                    : "text-green-600 dark:text-green-500"
                }
                strong
              />
            </div>
          </ComponentCard>
        )}

        {canMaterials && (
          <ComponentCard title="Recent Materials">
            {loadingMaterials && !materials ? (
              <ListSkeleton rows={4} />
            ) : !materials?.length ? (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <DocIcon className="size-12 text-gray-400" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No study materials uploaded yet.
                </p>
                <Button
                  nativeButton={false}
                  render={<Link href="/student/materials" />}
                >
                  Go to Materials
                </Button>
              </div>
            ) : (
              <>
                <ul className="-my-3 divide-y divide-gray-100 dark:divide-gray-800">
                  {materials.slice(0, 5).map((m) => (
                    <li key={m.id} className="flex items-center gap-3 py-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-500 dark:bg-brand-500/15">
                        {m.material_type === "PDF Document" ? (
                          <FilePdfIcon className="size-5" />
                        ) : (
                          <DocIcon className="size-5" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-gray-800 dark:text-white/90">
                          {m.title}
                        </span>
                        <span className="block truncate text-xs text-gray-500 dark:text-gray-400">
                          {m.topic}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant="outline"
                  className="w-full"
                  nativeButton={false}
                  render={<Link href="/student/materials" />}
                >
                  View all materials
                </Button>
              </>
            )}
          </ComponentCard>
        )}
      </div>
    </div>
  );
}
