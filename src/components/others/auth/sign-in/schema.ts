import { z } from "zod";

// One login page for admins, staff and students: the first field is an email
// (admin / staff) or a Student ID (student), kept under the key "email".
export const signInSchema = z.object({
  email: z.string().trim().min(1, "Email or Student ID is required"),
  password: z.string().min(1, "Password is required"),
  keepLoggedIn: z.boolean().optional(),
});

export type SignInFormData = z.infer<typeof signInSchema>;
