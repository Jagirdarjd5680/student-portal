export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const UPLOADS_URL =
  process.env.NEXT_PUBLIC_UPLOADS_URL || "http://localhost:5000/uploads";

export const AUTH_COOKIE =
  process.env.NEXT_PUBLIC_AUTH_COOKIE || "gog_admin_token";

export const STUDENT_COOKIE =
  process.env.NEXT_PUBLIC_STUDENT_COOKIE || "gog_student_token";

const IMAGE_RE = /\.(jpe?g|png|gif|webp)$/i;

// Images go through the web app's /api/photo route, which sends the login token to the
// API: without a valid login they never open. Documents (PDF / Word) keep the plain link.
export const fileUrl = (name?: string | null) => {
  if (!name) return "";
  return IMAGE_RE.test(name)
    ? `/api/photo/${encodeURIComponent(name)}`
    : `${UPLOADS_URL}/${name}`;
};
