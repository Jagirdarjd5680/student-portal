import { stripLeadingZeros } from "@/lib/format";
import { z } from "zod";

export const inquirySchema = z.object({
  student_name: z.string().trim().min(1, "Student Name is required"),
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
        .min(1, "Phone Number is required")
        .regex(/^[0-9+\-\s]{7,15}$/, "Please enter a valid phone number"),
    ),
  gender: z.string(),
  address: z.string(),
  state: z.string(),
  city: z.string(),
  zip_code: z
    .string()
    .trim()
    .regex(/^(\d{6})?$/, "Zip Code must be 6 digits"),
  receptionist_id: z.string().min(1, "Receptionist is required"),
  course_id: z.string().min(1, "Course is required"),
  source: z.string(),
  inquiry_date: z.string().min(1, "Date of Inquiry is required"),
});

export type InquiryFormData = z.infer<typeof inquirySchema>;
