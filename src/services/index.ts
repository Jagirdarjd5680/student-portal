// All backend calls in one place, grouped by module.
import type { SidebarTheme } from "@/lib/sidebar-theme";
import { api } from "@/lib/api-client";
import type { Permissions } from "@/data/permissions";
import type { AdminUser, StudentUser } from "@/lib/auth";
import type {
  Admission,
  Category,
  Course,
  DashboardOverview,
  Duration,
  Inquiry,
  Certificate,
  InstituteInfo,
  PortalMaterial,
  PortalMe,
  PortalPayment,
  InvoiceData,
  Payment,
  Receptionist,
  Refund,
  ReportSummary,
  Student,
  StudentDetail,
  StudyMaterial,
} from "@/types";

type Q = Record<string, string | undefined>;
type Body = Record<string, unknown>;
type Created = { id: number };

export interface StaffUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role_name: string | null;
  category: "receptionist" | "other";
  data_scope: "all" | "own";
  is_super: boolean;
  permissions: Permissions;
  created_at: string;
}

export interface AppSettings {
  inst_name: string;
  inst_address: string;
  inst_phone: string;
  inst_email: string;
  inst_website: string;
  inst_gstin: string;
  inst_terms: string;
  smtp_host: string;
  smtp_port: string;
  smtp_secure: string;
  smtp_user: string;
  /** Always blank when read; send a value only to change it. */
  smtp_pass: string;
  smtp_pass_set: boolean;
  smtp_from_name: string;
  smtp_from_email: string;
  /** "1" = email the PDFs automatically, "0" = off. */
  mail_auto: string;
  /** Admin sidebar colours (#rrggbb, blank = default). */
  sb_bg: string;
  sb_text: string;
  sb_active_bg: string;
  sb_active_text: string;
  sb_hover_bg: string;
  sb_hover_text: string;
}

export const settingsService = {
  get: () => api.get<AppSettings>("/settings"),
  /** Sidebar colours: readable by every logged-in admin user. */
  appearance: () => api.get<SidebarTheme>("/settings/appearance"),
  save: (body: Partial<AppSettings>) =>
    api.put<{ success: boolean }>("/settings", body),
  testSmtp: (body: Partial<AppSettings> & { to: string }) =>
    api.post<{ success: boolean }>("/settings/smtp/test", body),
};

export const studentPortalService = {
  login: (student_id: string, password: string) =>
    api.post<{ token: string; student: StudentUser }>("/student/auth/login", {
      student_id,
      password,
    }),
  me: () => api.get<PortalMe>("/student/me"),
  materials: () => api.get<PortalMaterial[]>("/student/materials"),
  payments: () => api.get<PortalPayment[]>("/student/payments"),
  invoice: (id: number) =>
    api.get<InvoiceData>(`/student/payments/${id}/invoice`),
  certificates: () => api.get<Certificate[]>("/student/certificates"),
  changePassword: (body: {
    current_password: string;
    new_password: string;
    confirm_password: string;
  }) => api.post<{ token: string }>("/student/password", body),
};

export const certificateService = {
  list: (q: Q = {}) => api.get<Certificate[]>("/certificates", q),
  create: (data: FormData) => api.post<Created>("/certificates", data),
  update: (id: number, data: FormData) =>
    api.put<Created>(`/certificates/${id}`, data),
  remove: (id: number) => api.delete(`/certificates/${id}`),
};

export interface MailResult {
  status: "sent" | "no_email" | "disabled" | "smtp_missing" | "failed";
  to?: string;
  message?: string;
}

export const mailService = {
  /** Email the PDFs just generated to the address saved on the record. */
  sendRecord: (body: {
    kind: "inquiry" | "admission" | "student";
    id: number;
    pdfs: { name: string; data: string }[];
  }) => api.post<MailResult>("/mail/record", body),
};

export const userService = {
  list: () => api.get<StaffUser[]>("/users"),
  create: (body: Body) => api.post<Created>("/users", body),
  update: (id: number, body: Body) => api.put<Created>(`/users/${id}`, body),
  remove: (id: number) => api.delete(`/users/${id}`),
};

export const authService = {
  me: () => api.get<{ admin: AdminUser }>("/auth/me"),
  updateProfile: (data: FormData) =>
    api.put<{ admin: AdminUser }>("/auth/profile", data),
  changePassword: (body: {
    current_password: string;
    new_password: string;
    confirm_password: string;
  }) => api.post<{ success: boolean; token: string }>("/auth/password", body),
  login: (email: string, password: string) =>
    api.post<{ token: string; admin: AdminUser }>("/auth/login", {
      email,
      password,
    }),
};

export const dashboardService = {
  overview: (q: Q = {}) => api.get<DashboardOverview>("/dashboard/overview", q),
};

export const receptionistService = {
  // all = also old records (for filters / names saved on old inquiries)
  list: (all = false) =>
    api.get<Receptionist[]>("/receptionists", all ? { all: 1 } : {}),
};

export const categoryService = {
  list: () => api.get<Category[]>("/categories"),
  save: (body: Body, id?: number) =>
    id
      ? api.put<Created>(`/categories/${id}`, body)
      : api.post<Created>("/categories", body),
  remove: (id: number) => api.delete(`/categories/${id}`),
};

export const durationService = {
  list: () => api.get<Duration[]>("/durations"),
  save: (body: Body, id?: number) =>
    id
      ? api.put<Created>(`/durations/${id}`, body)
      : api.post<Created>("/durations", body),
  remove: (id: number) => api.delete(`/durations/${id}`),
};

export const courseService = {
  list: (q: Q = {}) => api.get<Course[]>("/courses", q),
  save: (body: Body, id?: number) =>
    id
      ? api.put<Created>(`/courses/${id}`, body)
      : api.post<Created>("/courses", body),
  remove: (id: number) => api.delete(`/courses/${id}`),
};

export interface InquiryStats {
  total: number;
  pending: number;
  contacted: number;
  today: number;
  thisWeek: number;
}

export const inquiryService = {
  list: (q: Q = {}) => api.get<Inquiry[]>("/inquiries", q),
  stats: () => api.get<InquiryStats>("/inquiries/stats"),
  get: (id: number | string) => api.get<Inquiry>(`/inquiries/${id}`),
  institute: () => api.get<InstituteInfo>("/inquiries/institute"),
  create: (data: FormData) =>
    api.post<{ id: number; inquiry_no: string }>("/inquiries", data),
  update: (id: number | string, data: FormData) =>
    api.put<Created>(`/inquiries/${id}`, data),
  setStatus: (id: number, status: string) =>
    api.patch(`/inquiries/${id}/status`, { status }),
  remove: (id: number) => api.delete(`/inquiries/${id}`),
};

export interface AdmissionStats {
  total: number;
  pending: number;
  confirmed: number;
  today: number;
  thisWeek: number;
  totalFormFees: number;
}

export const admissionService = {
  list: (q: Q = {}) => api.get<Admission[]>("/admissions", q),
  stats: () => api.get<AdmissionStats>("/admissions/stats"),
  get: (id: number | string) => api.get<Admission>(`/admissions/${id}`),
  create: (data: FormData) =>
    api.post<{ id: number; admission_no: string }>("/admissions", data),
  update: (id: number | string, data: FormData) =>
    api.put<Created>(`/admissions/${id}`, data),
  setStatus: (id: number, status: string) =>
    api.patch(`/admissions/${id}/status`, { status }),
  remove: (id: number) => api.delete(`/admissions/${id}`),
};

export const studentService = {
  list: (q: Q = {}) => api.get<Student[]>("/students", q),
  get: (id: number | string) => api.get<StudentDetail>(`/students/${id}`),
  create: (data: FormData) =>
    api.post<{ id: number; student_code: string }>("/students", data),
  update: (id: number | string, data: FormData) =>
    api.put<Created>(`/students/${id}`, data),
  remove: (id: number) => api.delete(`/students/${id}`),
};

export const paymentService = {
  list: (q: Q = {}) => api.get<Payment[]>("/payments", q),
  create: (body: Body) =>
    api.post<{ id: number; invoice_no: string }>("/payments", body),
  remove: (id: number) => api.delete(`/payments/${id}`),
  invoice: (id: number) => api.get<InvoiceData>(`/payments/${id}/invoice`),
};

export const refundService = {
  list: (q: Q = {}) => api.get<Refund[]>("/refunds", q),
  create: (body: Body) => api.post<Created>("/refunds", body),
};

export const studyMaterialService = {
  list: (q: Q) => api.get<StudyMaterial[]>("/study-materials", q),
  topics: (q: Q) => api.get<string[]>("/study-materials/topics", q),
  save: (data: FormData, id?: number) =>
    id
      ? api.put<Created>(`/study-materials/${id}`, data)
      : api.post<Created>("/study-materials", data),
  remove: (id: number) => api.delete(`/study-materials/${id}`),
};

export const reportService = {
  payments: (q: Q) =>
    api.get<{ summary: ReportSummary; rows: Payment[] }>(
      "/reports/payments",
      q,
    ),
};
