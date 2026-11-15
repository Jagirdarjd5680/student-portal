import StudentShell from "@/components/student-portal/shell";

// Student portal pages: same shell as the admin panel, red/yellow theme.
export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div data-portal="student" className="contents">
      <StudentShell>{children}</StudentShell>
    </div>
  );
}
