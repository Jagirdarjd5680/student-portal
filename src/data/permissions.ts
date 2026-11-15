// Modules and actions a staff user can be given (must match backend utils/permissions.js).
export const PERMISSION_MODULES = [
  { key: "inquiries", label: "Inquiries" },
  { key: "admissions", label: "Admissions" },
  { key: "students", label: "Students" },
  { key: "courses", label: "Courses" },
  { key: "categories", label: "Categories" },
  { key: "durations", label: "Durations" },
  { key: "study_materials", label: "Study Materials" },
  { key: "payments", label: "Payments" },
  { key: "refunds", label: "Refunds" },
  { key: "reports", label: "Reports" },
  { key: "roles", label: "Roles & Permissions" },
  { key: "settings", label: "Settings" },
  { key: "certificates", label: "Certificates" },
] as const;

export const PERMISSION_ACTIONS = [
  { key: "view", label: "View" },
  { key: "add", label: "Add" },
  { key: "edit", label: "Edit" },
  { key: "delete", label: "Delete" },
] as const;

export type PermissionModule = (typeof PERMISSION_MODULES)[number]["key"];
export type PermissionAction = (typeof PERMISSION_ACTIONS)[number]["key"];
export type Permissions = Partial<Record<PermissionModule, PermissionAction[]>>;
