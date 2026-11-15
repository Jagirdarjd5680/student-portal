import { fileUrl } from "@/lib/config";
import { formatDate } from "@/lib/format";
import type { Student } from "@/types";
import { getInitials } from "@/utils";

interface ProfileCardProps {
  student: Student;
}

export default function ProfileCard({ student: s }: ProfileCardProps) {
  const info: [string, string][] = [
    ["Student ID", s.student_code],
    ["Email", s.email || "-"],
    ["Phone", s.phone || "-"],
    ["Date of Birth", formatDate(s.dob)],
    ["Admission Date", formatDate(s.admission_date)],
    ["Course", s.course_name || "-"],
    ["Duration", s.duration_name || "-"],
    ["Address", s.address || "-"],
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/3">
      <div className="flex flex-col gap-6 md:flex-row">
        <div className="flex shrink-0 flex-col items-center gap-3">
          {s.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={fileUrl(s.photo)}
              alt={s.full_name}
              className="size-24 rounded-full border border-gray-200 object-cover dark:border-gray-800"
            />
          ) : (
            <div className="flex size-24 items-center justify-center rounded-full bg-brand-50 text-2xl font-semibold text-brand-500 dark:bg-brand-500/15 dark:text-brand-400">
              {getInitials(s.full_name)}
            </div>
          )}
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {s.full_name}
          </h4>
        </div>
        <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {info.map(([label, value]) => (
            <div key={label}>
              <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                {label}
              </p>
              <p className="text-sm font-medium break-words text-gray-800 dark:text-white/90">
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
