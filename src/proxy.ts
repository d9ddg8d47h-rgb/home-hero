import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// Next.js 16 renamed `middleware.ts` to `proxy.ts` (same mechanism, new name).
// This keeps the Supabase auth session cookie fresh on every request and
// does an optimistic redirect for logged-out/logged-in users. Real
// authorization checks still happen server-side (see src/lib/dal.ts) and
// in Postgres Row Level Security — this is just the fast path.
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons/|manifest.json|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
