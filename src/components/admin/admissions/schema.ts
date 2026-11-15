import { stripLeadingZeros } from "@/lib/format";
import { z } from "zod";

export const admissionSchema = z
  .object({
    student_name: z.string().trim().min(1, "Student Name is required"),
    father_name: z.string(),
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
    dob: z.string(),
    address: z.string(),
    state: z.string().min(1, "State is required"),
    city: z.string().min(1, "City is required"),
    zip_code: z
      .string()
      .trim()
      .regex(/^(\d{6})?$/, "Zip Code must be 6 digits"),
    identity_proof: z.string(),
    identity_number: z.string().trim().max(50, "Too long"),
    receptionist_id: z.string().min(1, "Receptionist is required"),
    course_id: z.string().min(1, "Course is required"),
    form_fees: z.string().regex(/^(\d+(\.\d{1,2})?)?$/, "Enter a valid amount"),
    admission_date: z.string().min(1, "Date of Admission is required"),
    special_offer: z.boolean(),
    special_offer_text: z.string().trim().max(255, "Max 255 characters"),
  })
  .refine((d) => !d.special_offer || d.special_offer_text.length > 0, {
    path: ["special_offer_text"],
    message: "Please write the special offer",
  });

export type AdmissionFormData = z.infer<typeof admissionSchema>;
