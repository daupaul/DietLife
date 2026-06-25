import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUser } from "@/lib/auth/user";
import type {
  DietLog,
  ExerciseLog,
  FavoriteFood,
  Profile,
  WeightLog,
} from "@/types/db";

// All data access is server-side via the service role, scoped by the session
// user id (no Supabase Auth / no client-side Supabase calls). RLS stays on as
// a backstop. Never select password_hash or gemini_api_key toward the client.
const PROFILE_COLUMNS =
  "id, gender, age, height, weight, activity_level, daily_calorie_goal, protein_goal, carbs_goal, fat_goal, fiber_goal, sodium_goal, created_at, updated_at";

interface DateRange {
  from?: string;
  to?: string;
  limit?: number;
}

async function uid(): Promise<string | null> {
  const user = await getUser();
  return user?.id ?? null;
}

export async function getProfile(): Promise<Profile | null> {
  const id = await uid();
  if (!id) return null;
  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  return (data as Profile) ?? null;
}

export async function hasGeminiApiKey(): Promise<boolean> {
  const id = await uid();
  if (!id) return false;
  const admin = createAdminClient();
  const { data } = await admin
    .from("user_secrets")
    .select("gemini_api_key")
    .eq("user_id", id)
    .maybeSingle();
  return Boolean(data?.gemini_api_key);
}

/** The user's Gemini API key — server-only. Used by the Gemini action. */
export async function getGeminiApiKey(userId: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("user_secrets")
    .select("gemini_api_key")
    .eq("user_id", userId)
    .maybeSingle();
  return data?.gemini_api_key ?? null;
}

export async function listWeightLogs(limit = 90): Promise<WeightLog[]> {
  const id = await uid();
  if (!id) return [];
  const admin = createAdminClient();
  const { data } = await admin
    .from("weight_logs")
    .select("*")
    .eq("user_id", id)
    .order("datetime", { ascending: false })
    .limit(limit);
  return (data as WeightLog[]) ?? [];
}

export async function listDietLogs(range: DateRange = {}): Promise<DietLog[]> {
  const id = await uid();
  if (!id) return [];
  const admin = createAdminClient();
  let q = admin.from("diet_logs").select("*").eq("user_id", id);
  if (range.from) q = q.gte("datetime", range.from);
  if (range.to) q = q.lt("datetime", range.to);
  q = q.order("datetime", { ascending: false });
  if (range.limit) q = q.limit(range.limit);
  const { data } = await q;
  return (data as DietLog[]) ?? [];
}

export async function listExerciseLogs(
  range: DateRange = {},
): Promise<ExerciseLog[]> {
  const id = await uid();
  if (!id) return [];
  const admin = createAdminClient();
  let q = admin.from("exercise_logs").select("*").eq("user_id", id);
  if (range.from) q = q.gte("datetime", range.from);
  if (range.to) q = q.lt("datetime", range.to);
  q = q.order("datetime", { ascending: false });
  if (range.limit) q = q.limit(range.limit);
  const { data } = await q;
  return (data as ExerciseLog[]) ?? [];
}

export async function listFavoriteFoods(): Promise<FavoriteFood[]> {
  const id = await uid();
  if (!id) return [];
  const admin = createAdminClient();
  const { data } = await admin
    .from("favorite_foods")
    .select("*")
    .eq("user_id", id)
    .order("created_at", { ascending: false });
  return (data as FavoriteFood[]) ?? [];
}
