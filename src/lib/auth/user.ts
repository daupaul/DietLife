import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Current authenticated user, or null. Safe (verifies the JWT with Supabase). */
export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** Require a logged-in user or redirect to /login. Returns the user. */
export async function requireUser() {
  const user = await getUser();
  if (!user) redirect("/login");
  return user;
}
