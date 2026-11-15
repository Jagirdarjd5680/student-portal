"use client";

import ComponentCard from "@/components/common/component-card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { formatDate } from "@/lib/format";
import { useStudent } from "./context";
import InfoRow from "./info-row";

export default function StudentCourse() {
  const { me } = useStudent();
  const course = me?.course;
  if (!course) return null;

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <ComponentCard title="My Course" className="xl:col-span-2">
        <div className="-my-3">
          <InfoRow label="Course Name" value={course.name} strong />
          <InfoRow label="Category" value={course.category} />
          <InfoRow label="Duration" value={course.duration} />
          <InfoRow
            label="Admission Date"
            value={
              course.admission_date ? formatDate(course.admission_date) : "-"
            }
          />
        </div>
        {course.description && (
          <div>
            <h4 className="mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
              About this course
            </h4>
            <p className="text-sm whitespace-pre-line text-gray-600 dark:text-gray-400">
              {course.description}
            </p>
          </div>
        )}
      </ComponentCard>

      {me?.menus.includes("materials") && (
        <ComponentCard title="Study Materials">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Notes, PDFs and images shared by your institute for this course.
          </p>
          <Button
            className="w-full"
            nativeButton={false}
            render={<Link href="/student/materials" />}
          >
            Open Study Materials
          </Button>
        </ComponentCard>
      )}
    </div>
  );
}
