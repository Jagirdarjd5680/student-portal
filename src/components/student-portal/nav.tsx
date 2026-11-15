import {
  BoxIcon,
  DocIcon,
  DollarIcon,
  StarIcon,
  LayoutGridIcon,
  LogOutIcon,
  UserCircleIcon,
} from "@/icons";
import type { NavItem } from "@/layout/app-layout/sidebar/types";

// Student portal menu. `portalMenu` ties an item to the admin-set access (dashboard + logout are always on).
export const studentNav: NavItem[] = [
  {
    icon: <LayoutGridIcon className="size-6" />,
    key: "studentDashboard",
    path: "/student/dashboard",
  },
  {
    icon: <BoxIcon className="size-6" />,
    key: "studentCourse",
    path: "/student/course",
    portalMenu: "course",
  },
  {
    icon: <DocIcon className="size-6" />,
    key: "studentMaterials",
    path: "/student/materials",
    portalMenu: "materials",
  },
  {
    icon: <UserCircleIcon className="size-6" />,
    key: "studentProfile",
    path: "/student/profile",
    portalMenu: "profile",
  },
  {
    icon: <DollarIcon className="size-6" />,
    key: "studentPayments",
    path: "/student/payments",
    portalMenu: "payments",
  },
  {
    icon: <StarIcon className="size-6" />,
    key: "studentCertificates",
    path: "/student/certificates",
    portalMenu: "certificates",
  },
  {
    icon: <LogOutIcon className="size-6" />,
    key: "studentLogout",
    path: "/student/logout",
  },
];

/** Which menu a portal URL needs ("/student/course" → "course"). Dashboard / logout need none. */
export function menuForPath(pathname: string): string | null {
  const hit = studentNav.find(
    (n) =>
      n.portalMenu &&
      (pathname === n.path || pathname.startsWith(`${n.path}/`)),
  );
  return hit?.portalMenu ?? null;
}
