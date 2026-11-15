import {
  clearSession,
  clearStudentSession,
  getStudentToken,
  getToken,
} from "./auth";
import { API_URL } from "./config";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type Query = Record<string, string | number | undefined | null>;

function buildUrl(path: string, query?: Query) {
  const url = new URL(`${API_URL}${path}`);
  Object.entries(query || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
}

async function request<T>(
  method: string,
  path: string,
  options: { query?: Query; body?: unknown } = {},
): Promise<T> {
  const headers: Record<string, string> = {};
  // "/student/..." = student portal API (admin "/students" is different: no trailing slash).
  const isStudentApi = path.startsWith("/student/");
  const token = isStudentApi ? getStudentToken() : getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let body: BodyInit | undefined;
  if (options.body instanceof FormData) {
    body = options.body;
  } else if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.body);
  }

  let res: Response;
  try {
    res = await fetch(buildUrl(path, options.query), { method, headers, body });
  } catch {
    throw new ApiError(0, "Cannot reach server. Is the backend running?");
  }

  const data = await res.json().catch(() => ({}));

  if (
    res.status === 401 &&
    path !== "/auth/login" &&
    path !== "/student/auth/login"
  ) {
    if (isStudentApi) {
      clearStudentSession();
      window.location.href = "/signin";
    } else {
      clearSession();
      window.location.href = "/signin";
    }
  }
  if (!res.ok) {
    throw new ApiError(res.status, data?.message || "Something went wrong");
  }
  return data as T;
}

/** Fetch a protected file (sent only with the login token) as a Blob. */
export async function fetchBlob(path: string, query?: Query): Promise<Blob> {
  const isStudentApi = path.startsWith("/student/");
  const token = isStudentApi ? getStudentToken() : getToken();
  let res: Response;
  try {
    res = await fetch(buildUrl(path, query), {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  } catch {
    throw new ApiError(0, "Cannot reach server. Is the backend running?");
  }
  if (res.status === 401) {
    if (isStudentApi) {
      clearStudentSession();
      window.location.href = "/signin";
    } else {
      clearSession();
      window.location.href = "/signin";
    }
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(res.status, data?.message || "Could not open the file");
  }
  return res.blob();
}

export const api = {
  get: <T>(path: string, query?: Query) => request<T>("GET", path, { query }),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, { body }),
  put: <T>(path: string, body?: unknown) => request<T>("PUT", path, { body }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>("PATCH", path, { body }),
  delete: <T>(path: string) => request<T>("DELETE", path),
};

// Converts a plain object (+ optional file) into FormData for uploads.
export function toFormData(
  values: Record<string, unknown>,
  files: Record<string, File | null | undefined> = {},
) {
  const fd = new FormData();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== null) fd.append(key, String(value));
  });
  Object.entries(files).forEach(([key, file]) => {
    if (file) fd.append(key, file);
  });
  return fd;
}
