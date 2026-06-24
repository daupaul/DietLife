"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  dietLogSchema,
  exerciseLogSchema,
  favoriteFoodSchema,
  geminiKeySchema,
  idSchema,
  profileSchema,
  weightLogSchema,
} from "@/lib/validation/schemas";
import type { ActionResult } from "./types";

const SAVE_FAILED = "儲存失敗，請稍後再試";
const NOT_AUTHED = "請先登入";

async function getAuthed() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

/** Generic helper: first Zod issue message. */
function firstError(message?: string) {
  return message ?? "輸入無效";
}

// ── profile ─────────────────────────────────────────────────────
export async function updateProfile(input: unknown): Promise<ActionResult> {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: firstError(parsed.error.issues[0]?.message) };
  }
  const { supabase, user } = await getAuthed();
  if (!user) return { ok: false, error: NOT_AUTHED };

  const { error } = await supabase
    .from("profiles")
    .update(parsed.data)
    .eq("id", user.id);
  if (error) return { ok: false, error: SAVE_FAILED };

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { ok: true };
}

// ── gemini key (server-only column; written via admin client) ───
export async function setGeminiApiKey(input: unknown): Promise<ActionResult> {
  const parsed = geminiKeySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: firstError(parsed.error.issues[0]?.message) };
  }
  const { user } = await getAuthed();
  if (!user) return { ok: false, error: NOT_AUTHED };

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ gemini_api_key: parsed.data.apiKey })
    .eq("id", user.id);
  if (error) return { ok: false, error: SAVE_FAILED };

  revalidatePath("/settings");
  return { ok: true };
}

export async function clearGeminiApiKey(): Promise<ActionResult> {
  const { user } = await getAuthed();
  if (!user) return { ok: false, error: NOT_AUTHED };

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ gemini_api_key: null })
    .eq("id", user.id);
  if (error) return { ok: false, error: SAVE_FAILED };

  revalidatePath("/settings");
  return { ok: true };
}

// ── weight ──────────────────────────────────────────────────────
export async function addWeightLog(input: unknown): Promise<ActionResult> {
  const parsed = weightLogSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: firstError(parsed.error.issues[0]?.message) };
  }
  const { supabase, user } = await getAuthed();
  if (!user) return { ok: false, error: NOT_AUTHED };

  const { error } = await supabase.from("weight_logs").insert({
    user_id: user.id,
    datetime: new Date(parsed.data.datetime).toISOString(),
    weight: parsed.data.weight,
  });
  if (error) return { ok: false, error: SAVE_FAILED };

  revalidatePath("/weight");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteWeightLog(id: unknown): Promise<ActionResult> {
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return { ok: false, error: "無效的項目" };
  const { supabase, user } = await getAuthed();
  if (!user) return { ok: false, error: NOT_AUTHED };

  const { error } = await supabase
    .from("weight_logs")
    .delete()
    .eq("id", parsed.data)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: SAVE_FAILED };

  revalidatePath("/weight");
  revalidatePath("/dashboard");
  return { ok: true };
}

// ── diet ────────────────────────────────────────────────────────
export async function addDietLog(input: unknown): Promise<ActionResult> {
  const parsed = dietLogSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: firstError(parsed.error.issues[0]?.message) };
  }
  const { supabase, user } = await getAuthed();
  if (!user) return { ok: false, error: NOT_AUTHED };

  const { datetime, ...rest } = parsed.data;
  const { error } = await supabase.from("diet_logs").insert({
    user_id: user.id,
    datetime: new Date(datetime).toISOString(),
    ...rest,
  });
  if (error) return { ok: false, error: SAVE_FAILED };

  revalidatePath("/diet");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteDietLog(id: unknown): Promise<ActionResult> {
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return { ok: false, error: "無效的項目" };
  const { supabase, user } = await getAuthed();
  if (!user) return { ok: false, error: NOT_AUTHED };

  const { error } = await supabase
    .from("diet_logs")
    .delete()
    .eq("id", parsed.data)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: SAVE_FAILED };

  revalidatePath("/diet");
  revalidatePath("/dashboard");
  return { ok: true };
}

// ── exercise ────────────────────────────────────────────────────
export async function addExerciseLog(input: unknown): Promise<ActionResult> {
  const parsed = exerciseLogSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: firstError(parsed.error.issues[0]?.message) };
  }
  const { supabase, user } = await getAuthed();
  if (!user) return { ok: false, error: NOT_AUTHED };

  const { datetime, ...rest } = parsed.data;
  const { error } = await supabase.from("exercise_logs").insert({
    user_id: user.id,
    datetime: new Date(datetime).toISOString(),
    ...rest,
  });
  if (error) return { ok: false, error: SAVE_FAILED };

  revalidatePath("/exercise");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteExerciseLog(id: unknown): Promise<ActionResult> {
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return { ok: false, error: "無效的項目" };
  const { supabase, user } = await getAuthed();
  if (!user) return { ok: false, error: NOT_AUTHED };

  const { error } = await supabase
    .from("exercise_logs")
    .delete()
    .eq("id", parsed.data)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: SAVE_FAILED };

  revalidatePath("/exercise");
  revalidatePath("/dashboard");
  return { ok: true };
}

// ── favorite foods ──────────────────────────────────────────────
export async function addFavoriteFood(input: unknown): Promise<ActionResult> {
  const parsed = favoriteFoodSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: firstError(parsed.error.issues[0]?.message) };
  }
  const { supabase, user } = await getAuthed();
  if (!user) return { ok: false, error: NOT_AUTHED };

  const { error } = await supabase
    .from("favorite_foods")
    .insert({ user_id: user.id, ...parsed.data });
  if (error) return { ok: false, error: SAVE_FAILED };

  revalidatePath("/diet");
  return { ok: true };
}

export async function deleteFavoriteFood(id: unknown): Promise<ActionResult> {
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return { ok: false, error: "無效的項目" };
  const { supabase, user } = await getAuthed();
  if (!user) return { ok: false, error: NOT_AUTHED };

  const { error } = await supabase
    .from("favorite_foods")
    .delete()
    .eq("id", parsed.data)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: SAVE_FAILED };

  revalidatePath("/diet");
  return { ok: true };
}
