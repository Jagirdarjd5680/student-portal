export interface Option {
  label: string;
  value: string;
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
  course_count?: number;
}

export interface Duration {
  id: number;
  name: string;
  days: number;
  description: string | null;
}

export interface Course {
  id: number;
  name: string;
  category_id: number | null;
  category_name: string | null;
  fee: number;
  duration_id: number | null;
  duration_name: string | null;
  description: string | null;
}

export interface Receptionist {
  id: number;
  name: string;
  /** Linked to a role user whose category is Receptionist. */
  active?: number;
}

export interface Inquiry {
  id: number;
  inquiry_no: string;
  student_name: string;
  photo: string | null;
  email: string | null;
  phone: string;
  gender: string | null;
  address: string | null;
  state: string | null;
  city: string | null;
  zip_code: string | null;
  receptionist_id: number | null;
  receptionist_name: string | null;
  course_id: number | null;
  course_name: string | null;
  source: string | null;
  inquiry_date: string;
  status: "Pending" | "Contacted";
}

export interface Admission {
  id: number;
  admission_no: string;
  student_name: string;
  photo: string | null;
  father_name: string | null;
  email: string | null;
  phone: string;
  gender: string | null;
  dob: string | null;
  address: string | null;
  state: string;
  city: string;
  zip_code: string | null;
  identity_proof: string | null;
  identity_number: string | null;
  receptionist_id: number | null;
  receptionist_name: string | null;
  course_id: number | null;
  course_name: string | null;
  /** The inquiry this admission was converted from. */
  inquiry_id?: number | null;
  form_fees: number;
  admission_date: string;
  special_offer: number;
  special_offer_text: string | null;
  status: "Pending" | "Confirmed";
}

export interface Student {
  id: number;
  student_code: string;
  first_name: string;
  last_name: string | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  dob: string | null;
  admission_date: string | null;
  address: string | null;
  course_id: number | null;
  course_name: string | null;
  duration_id: number | null;
  duration_name: string | null;
  course_fee: number;
  discount_type: "fixed" | "percentage";
  discount_value: number;
  discount_amount: number;
  total_fee: number;
  total_paid: number;
  balance: number;
  photo: string | null;
  /** JSON array of student-portal menus; null = all. */
  portal_menus: string | null;
  has_password: number;
}

export interface Payment {
  id: number;
  invoice_no: string;
  student_id: number;
  student_code?: string;
  student_name?: string;
  course_name?: string | null;
  amount: number;
  payment_date: string;
  method: string;
  transaction_id: string | null;
  description: string | null;
}

export interface StudentDetail extends Student {
  payments: Payment[];
}

export interface Refund {
  id: number;
  student_id: number;
  student_code: string;
  student_name: string;
  amount: number;
  refund_date: string;
  method: string;
  transaction_id: string | null;
  description: string | null;
}

export interface StudyMaterial {
  id: number;
  course_id: number;
  duration_id: number;
  topic: string;
  material_type: "PDF Document" | "Image" | "Text Content";
  title: string;
  content: string | null;
  file_path: string | null;
}

export interface InvoiceData {
  institute: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website?: string;
    gstin: string;
    terms: string[];
  };
  payment: Payment & {
    student_address: string | null;
    student_phone: string | null;
    student_email: string | null;
  };
  item: { name: string | null; hsn: string; quantity: number };
  totals: { subTotal: number; sgst: number; cgst: number; total: number };
}

export interface ReportSummary {
  totalPayments: number;
  totalAmount: number;
  totalRefunds: number;
  refundCount: number;
  netIncome: number;
  averagePayment: number;
}

export interface InstituteInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  gstin?: string;
  terms?: string[];
}

export interface DashboardTotals {
  students: number;
  inquiries: number;
  admissions: number;
  revenue: number;
}

export interface DashboardActivity {
  type: "inquiry" | "admission" | "payment";
  id: number;
  name: string;
  detail: string | null;
  amount: number | null;
  date: string;
  at: string;
}

export interface DashboardOverview {
  range: { from: string; to: string; unit: "day" | "month" };
  totals: DashboardTotals;
  previous: DashboardTotals;
  series: {
    labels: string[];
    revenue: number[];
    inquiries: number[];
    admissions: number[];
  };
  paymentMethods: { label: string; amount: number; count: number }[];
  admissionsByCourse: { label: string; count: number }[];
  inquiryStatus: { pending: number; confirmed: number };
  recent: DashboardActivity[];
  /** Which modules this user may see (cards / charts are hidden otherwise). */
  visible: {
    students: boolean;
    inquiries: boolean;
    admissions: boolean;
    revenue: boolean;
  };
}

// ── Student portal ──
export interface PortalMe {
  menus: string[];
  institute: { name: string };
  student: {
    id: number;
    student_code: string;
    first_name: string;
    last_name: string | null;
    full_name: string;
    photo: string | null;
  };
  profile: {
    email: string | null;
    phone: string | null;
    dob: string | null;
    admission_date: string | null;
    address: string | null;
  } | null;
  course: {
    name: string | null;
    category: string | null;
    description: string | null;
    duration: string | null;
    admission_date: string | null;
  } | null;
  fees: {
    course_fee: number;
    discount_type: "fixed" | "percentage";
    discount_value: number;
    discount_amount: number;
    total_fee: number;
    total_paid: number;
    balance: number;
  } | null;
}

export interface PortalMaterial {
  id: number;
  topic: string;
  material_type: "PDF Document" | "Image" | "Text Content";
  title: string;
  content: string | null;
  file_path: string | null;
  created_at: string;
}

export interface PortalPayment {
  id: number;
  invoice_no: string;
  amount: number;
  payment_date: string;
  method: string;
  transaction_id: string | null;
  description: string | null;
}

export interface Certificate {
  id: number;
  student_id: number;
  title: string;
  code: string;
  original_name: string | null;
  file_kind: "pdf" | "image";
  created_at: string;
  student_code: string;
  student_name: string;
}
