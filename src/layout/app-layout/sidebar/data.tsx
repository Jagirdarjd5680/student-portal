import {
  BanknoteUndoIcon,
  BarChartIcon,
  BoxIcon,
  CalendarIcon,
  DollarIcon,
  DocIcon,
  StarIcon,
  GearIcon,
  KeyIcon,
  LayoutGridIcon,
  LogOutIcon,
  MailIcon,
  PageIcon,
  TagIcon,
  UsersIcon,
} from "@/icons";
import type { NavItem } from "./types";

export const navItems: NavItem[] = [
  {
    icon: <LayoutGridIcon className="size-6" />,
    key: "dashboard",
    path: "/",
  },
  {
    icon: <MailIcon className="size-6" />,
    key: "inquiries",
    module: "inquiries",
    subItems: [
      { key: "allInquiries", path: "/inquiries" },
      { key: "addInquiry", path: "/inquiries/add", action: "add" },
      { key: "pendingInquiries", path: "/inquiries/pending" },
      { key: "inquiryReports", path: "/inquiries/reports" },
    ],
  },
  {
    icon: <PageIcon className="size-6" />,
    key: "admissions",
    module: "admissions",
    subItems: [
      { key: "allAdmissions", path: "/admissions" },
      { key: "addAdmission", path: "/admissions/add", action: "add" },
      { key: "pendingAdmissions", path: "/admissions/pending" },
      { key: "admissionReports", path: "/admissions/reports" },
    ],
  },
  {
    icon: <UsersIcon className="size-6" />,
    key: "students",
    module: "students",
    subItems: [
      { key: "allStudents", path: "/students" },
      { key: "addStudent", path: "/students/add", action: "add" },
    ],
  },
  {
    icon: <BoxIcon className="size-6" />,
    key: "courses",
    module: "courses",
    path: "/courses",
  },
  {
    icon: <DocIcon className="size-6" />,
    key: "studyMaterials",
    module: "study_materials",
    path: "/study-materials",
  },
  {
    icon: <TagIcon className="size-6" />,
    key: "categories",
    module: "categories",
    path: "/categories",
  },
  {
    icon: <CalendarIcon className="size-6" />,
    key: "durations",
    module: "durations",
    path: "/durations",
  },
  {
    icon: <DollarIcon className="size-6" />,
    key: "payments",
    module: "payments",
    subItems: [
      { key: "allPayments", path: "/payments" },
      { key: "addPayment", path: "/payments/add", action: "add" },
    ],
  },
  {
    icon: <BanknoteUndoIcon className="size-6" />,
    key: "refunds",
    module: "refunds",
    path: "/refunds",
  },
  {
    icon: <StarIcon className="size-6" />,
    key: "certificates",
    module: "certificates",
    path: "/certificates",
  },
  {
    icon: <BarChartIcon className="size-6" />,
    key: "reports",
    module: "reports",
    path: "/reports",
  },
  {
    icon: <KeyIcon className="size-6" />,
    key: "roles",
    module: "roles",
    path: "/roles",
  },
  {
    icon: <GearIcon className="size-6" />,
    key: "settings",
    module: "settings",
    path: "/settings",
  },
  {
    icon: <LogOutIcon className="size-6" />,
    key: "logout",
    path: "/logout",
  },
];

export const othersItems: NavItem[] = [];

export const supportItems: NavItem[] = [];
