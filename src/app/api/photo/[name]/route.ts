import { NextResponse, type NextRequest } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const AUTH_COOKIE = process.env.NEXT_PUBLIC_AUTH_COOKIE || "gog_admin_token";
const STUDENT_COOKIE =
  process.env.NEXT_PUBLIC_STUDENT_COOKIE || "gog_student_token";

const notFound = () =>
  new NextResponse("Not found", {
    status: 404,
    headers: { "Cache-Control": "no-store" },
  });

// Serves an uploaded image to a signed-in user. The browser sends its login cookie;
// this route forwards it to the API as a Bearer token. No (valid) login = no image.
export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ name: string }> },
) {
  const { name } = await ctx.params;
  const tokens = [
    request.cookies.get(AUTH_COOKIE)?.value,
    request.cookies.get(STUDENT_COOKIE)?.value,
  ].filter(Boolean) as string[];
  if (!tokens.length) return notFound();

  for (const token of tokens) {
    try {
      const res = await fetch(`${API_URL}/photos/${encodeURIComponent(name)}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) continue;
      return new NextResponse(res.body, {
        headers: {
          "Content-Type": res.headers.get("content-type") || "image/jpeg",
          "Cache-Control": "private, max-age=300",
          "X-Content-Type-Options": "nosniff",
          "Content-Disposition": "inline",
        },
      });
    } catch {
      /* try the next token */
    }
  }
  return notFound();
}
