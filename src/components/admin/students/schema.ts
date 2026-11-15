import { stripLeadingZeros } from "@/lib/format";
import type { Student } from "@/types";
import { z } from "zod";

export const makeStudentSchema = (editing: boolean) =>
  z
    .object({
      first_name: z.string().trim().min(1, "First Name is required"),
      last_name: z.string(),
      email: z
        .string()
        .trim()
        .email("Please enter a valid email")
        .or(z.literal("")),
      phone: z
        .string()
        .transform(stripLeadingZeros)
        .pipe(
          z
            .string()
            .trim()
            .regex(
              /^([0-9+\-\s]{7,15})?$/,
              "Please enter a valid phone number",
            ),
        ),
      dob: z.string(),
      admission_date: z.string(),
      address: z.string(),
      course_id: z.string().min(1, "Course is required"),
      duration_id: z.string(),
      discount_type: z.enum(["fixed", "percentage"]),
      discount_value: z
        .string()
        .regex(/^(\d+(\.\d{1,2})?)?$/, "Enter a valid number"),
      password: z.string(),
      confirm_password: z.string(),
    })
    .superRefine((d, ctx) => {
      // Create: password required. Edit: blank = keep the current one.
      if (!editing && !d.password) {
        ctx.addIssue({
          code: "custom",
          path: ["password"],
          message: "Password is required",
        });
      }
      if (d.password && d.password.length < 8) {
        ctx.addIssue({
          code: "custom",
          path: ["password"],
          message: "Password must be at least 8 characters",
        });
      }
      if (d.password !== d.confirm_password) {
        ctx.addIssue({
          code: "custom",
          path: ["confirm_password"],
          message: "Passwords do not match",
        });
      }
    })
    .refine(
      (d) =>
        d.discount_type !== "percentage" ||
        Number(d.discount_value || 0) <= 100,
      {
        path: ["discount_value"],
        message: "Percentage cannot be more than 100",
      },
    );

export type StudentFormData = z.infer<ReturnType<typeof makeStudentSchema>>;

export const emptyStudent = (): StudentFormData => ({
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  dob: "",
  admission_date: "",
  address: "",
  course_id: "",
  duration_id: "",
  discount_type: "fixed",
  discount_value: "",
  password: "",
  confirm_password: "",
});

export const studentToForm = (s: Student): StudentFormData => ({
  first_name: s.first_name,
  last_name: s.last_name || "",
  email: s.email || "",
  phone: s.phone || "",
  dob: s.dob || "",
  admission_date: s.admission_date || "",
  address: s.address || "",
  course_id: s.course_id ? String(s.course_id) : "",
  duration_id: s.duration_id ? String(s.duration_id) : "",
  discount_type: s.discount_type,
  discount_value: s.discount_value ? String(s.discount_value) : "",
  password: "",
  confirm_password: "",
});

/** Student-portal menus an admin can switch on or off ("Dashboard" is always on). */
export const PORTAL_MENU_OPTIONS = [
  { key: "course", label: "My Course" },
  { key: "materials", label: "Study Materials" },
  { key: "profile", label: "Profile" },
  { key: "payments", label: "Payment History" },
  { key: "certificates", label: "My Certificates" },
] as const;

export const ALL_PORTAL_MENUS: string[] = PORTAL_MENU_OPTIONS.map((m) => m.key);

/** Stored value → list (null/invalid = all menus). */
export function parsePortalMenus(value: string | null | undefined): string[] {
  if (!value) return ALL_PORTAL_MENUS;
  try {
    const raw = JSON.parse(value);
    return Array.isArray(raw)
      ? ALL_PORTAL_MENUS.filter((m) => raw.includes(m))
      : ALL_PORTAL_MENUS;
  } catch {
    return ALL_PORTAL_MENUS;
  }
}

// Same calculation as the backend.
export function calcFee(fee: number, type: string, value: number) {
  const v = Math.max(value || 0, 0);
  let discount = type === "percentage" ? (fee * Math.min(v, 100)) / 100 : v;
  discount = Math.min(Math.round(discount * 100) / 100, fee);
  return { discount, total: Math.round((fee - discount) * 100) / 100 };
}
