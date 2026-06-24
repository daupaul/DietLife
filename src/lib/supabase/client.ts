import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client (for Client Components only).
 * Uses the public anon key — safe to ship to the client. RLS enforces
 * that a user can only read/write their own rows.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
