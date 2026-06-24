import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUser } from "@/lib/auth/user";
import type {
  DietLog,
  ExerciseLog,
  FavoriteFood,
  Profile,
  WeightLog,
} from "@/types/db";

const PROFILE_COLUMNS =
  "id, gender, age, height, weight, activity_level, daily_calorie_goal, protein_goal, carbs_goal, fat_goal, fiber_goal, sodium_goal, created_at, updated_at";

interface DateRange {
  from?: string; // ISO (inclusive)
  to?: string; // ISO (exclusive)
  limit?: number;
}

/** The current user's profile (without the server-only gemini key). */
export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .single();
  if (error) return null;
  return data as Profile;
}

/** Whether the user has set a Gemini API key — without exposing the value. */
export async function hasGeminiApiKey(): Promise<boolean> {
  const user = await getUser();
  if (!user) return false;
  const admin = createAdminClient();
  const { data } = await admin
    .from("user_secrets")
    .select("gemini_api_key")
    .eq("user_id", user.id)
    .maybeSingle();
  return Boolean(data?.gemini_api_key);
}

/**
 * The user's Gemini API key — server-only (admin client reads user_secrets,
 * which is unreadable by client roles via RLS). Used by the Gemini Server
 * Action in Phase 3.5. Never return this to the client.
 */
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
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("weight_logs")
    .select("*")
    .order("datetime", { ascending: false })
    .limit(limit);
  if (error) return [];
  return data as WeightLog[];
}

export async function listDietLogs(range: DateRange = {}): Promise<DietLog[]> {
  const supabase = await createClient();
  let q = supabase.from("diet_logs").select("*");
  if (range.from) q = q.gte("datetime", range.from);
  if (range.to) q = q.lt("datetime", range.to);
  q = q.order("datetime", { ascending: false });
  if (range.limit) q = q.limit(range.limit);
  const { data, error } = await q;
  if (error) return [];
  return data as DietLog[];
}

export async function listExerciseLogs(
  range: DateRange = {},
): Promise<ExerciseLog[]> {
  const supabase = await createClient();
  let q = supabase.from("exercise_logs").select("*");
  if (range.from) q = q.gte("datetime", range.from);
  if (range.to) q = q.lt("datetime", range.to);
  q = q.order("datetime", { ascending: false });
  if (range.limit) q = q.limit(range.limit);
  const { data, error } = await q;
  if (error) return [];
  return data as ExerciseLog[];
}

export async function listFavoriteFoods(): Promise<FavoriteFood[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("favorite_foods")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return [];
  return data as FavoriteFood[];
}
