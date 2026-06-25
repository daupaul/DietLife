"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUser } from "@/lib/auth/user";
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

async function authed() {
  const user = await getUser();
  if (!user) return null;
  return { userId: user.id, admin: createAdminClient() };
}

function firstError(message?: string) {
  return message ?? "輸入無效";
}

// ── profile ─────────────────────────────────────────────────────
export async function updateProfile(input: unknown): Promise<ActionResult> {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: firstError(parsed.error.issues[0]?.message) };
  }
  const ctx = await authed();
  if (!ctx) return { ok: false, error: NOT_AUTHED };

  const { error } = await ctx.admin
    .from("profiles")
    .update(parsed.data)
    .eq("id", ctx.userId);
  if (error) return { ok: false, error: SAVE_FAILED };

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { ok: true };
}

// ── gemini key (server-only table) ──────────────────────────────
export async function setGeminiApiKey(input: unknown): Promise<ActionResult> {
  const parsed = geminiKeySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: firstError(parsed.error.issues[0]?.message) };
  }
  const ctx = await authed();
  if (!ctx) return { ok: false, error: NOT_AUTHED };

  const { error } = await ctx.admin
    .from("user_secrets")
    .upsert(
      { user_id: ctx.userId, gemini_api_key: parsed.data.apiKey },
      { onConflict: "user_id" },
    );
  if (error) return { ok: false, error: SAVE_FAILED };

  revalidatePath("/settings");
  return { ok: true };
}

export async function clearGeminiApiKey(): Promise<ActionResult> {
  const ctx = await authed();
  if (!ctx) return { ok: false, error: NOT_AUTHED };

  const { error } = await ctx.admin
    .from("user_secrets")
    .delete()
    .eq("user_id", ctx.userId);
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
  const ctx = await authed();
  if (!ctx) return { ok: false, error: NOT_AUTHED };

  const { error } = await ctx.admin.from("weight_logs").insert({
    user_id: ctx.userId,
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
  const ctx = await authed();
  if (!ctx) return { ok: false, error: NOT_AUTHED };

  const { error } = await ctx.admin
    .from("weight_logs")
    .delete()
    .eq("id", parsed.data)
    .eq("user_id", ctx.userId);
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
  const ctx = await authed();
  if (!ctx) return { ok: false, error: NOT_AUTHED };

  const { datetime, ...rest } = parsed.data;
  const { error } = await ctx.admin.from("diet_logs").insert({
    user_id: ctx.userId,
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
  const ctx = await authed();
  if (!ctx) return { ok: false, error: NOT_AUTHED };

  const { error } = await ctx.admin
    .from("diet_logs")
    .delete()
    .eq("id", parsed.data)
    .eq("user_id", ctx.userId);
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
  const ctx = await authed();
  if (!ctx) return { ok: false, error: NOT_AUTHED };

  const { datetime, ...rest } = parsed.data;
  const { error } = await ctx.admin.from("exercise_logs").insert({
    user_id: ctx.userId,
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
  const ctx = await authed();
  if (!ctx) return { ok: false, error: NOT_AUTHED };

  const { error } = await ctx.admin
    .from("exercise_logs")
    .delete()
    .eq("id", parsed.data)
    .eq("user_id", ctx.userId);
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
  const ctx = await authed();
  if (!ctx) return { ok: false, error: NOT_AUTHED };

  const { error } = await ctx.admin
    .from("favorite_foods")
    .insert({ user_id: ctx.userId, ...parsed.data });
  if (error) return { ok: false, error: SAVE_FAILED };

  revalidatePath("/diet");
  return { ok: true };
}

export async function deleteFavoriteFood(id: unknown): Promise<ActionResult> {
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return { ok: false, error: "無效的項目" };
  const ctx = await authed();
  if (!ctx) return { ok: false, error: NOT_AUTHED };

  const { error } = await ctx.admin
    .from("favorite_foods")
    .delete()
    .eq("id", parsed.data)
    .eq("user_id", ctx.userId);
  if (error) return { ok: false, error: SAVE_FAILED };

  revalidatePath("/diet");
  return { ok: true };
}
