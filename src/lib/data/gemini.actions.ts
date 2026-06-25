"use server";

import { z } from "zod";
import { getUser } from "@/lib/auth/user";
import { getGeminiApiKey } from "@/lib/data/queries";
import { allowRequest } from "@/lib/gemini/ratelimit";
import {
  GeminiError,
  estimateFromImage,
  estimateFromText,
  estimateMets,
  type NutritionEstimate,
} from "@/lib/gemini/estimate";
import type { ActionResult } from "./types";

const activitySchema = z.object({
  activity: z.string().trim().min(1, "請輸入運動項目").max(100),
});

const textSchema = z.object({
  description: z.string().trim().min(1, "請輸入食物描述").max(500),
});

// ~6MB image as base64 (≈ 8M chars). Type restricted to common photo formats.
const imageSchema = z.object({
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  base64: z.string().min(1).max(8_000_000),
});

type Ready = { key: string } | { error: string };

async function ready(): Promise<Ready> {
  const user = await getUser();
  if (!user) return { error: "請先登入" };
  if (!allowRequest(user.id)) return { error: "操作太頻繁，請稍候幾秒再試" };
  const key = await getGeminiApiKey(user.id);
  if (!key) return { error: "尚未設定 Gemini 金鑰，請到「設定」頁填入" };
  return { key };
}

function mapError(e: unknown): string {
  if (e instanceof GeminiError) {
    if (e.code === "invalid_key") return "Gemini 金鑰無效，請到「設定」頁確認";
    if (e.code === "unavailable") return "Gemini 暫時忙碌，請稍後再試";
  }
  return "估算失敗，請再試一次";
}

export async function estimateFoodFromText(
  input: unknown,
): Promise<ActionResult<NutritionEstimate>> {
  const parsed = textSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0]?.message ?? "輸入無效" };

  const r = await ready();
  if ("error" in r) return { ok: false, error: r.error };

  try {
    const data = await estimateFromText(r.key, parsed.data.description);
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: mapError(e) };
  }
}

export async function estimateFoodFromImage(
  input: unknown,
): Promise<ActionResult<NutritionEstimate>> {
  const parsed = imageSchema.safeParse(input);
  if (!parsed.success)
    return {
      ok: false,
      error: "圖片格式或大小不符（限 JPG/PNG/WebP、5MB 內）",
    };

  const r = await ready();
  if ("error" in r) return { ok: false, error: r.error };

  try {
    const data = await estimateFromImage(
      r.key,
      parsed.data.base64,
      parsed.data.mimeType,
    );
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: mapError(e) };
  }
}

export async function estimateExerciseMets(
  input: unknown,
): Promise<ActionResult<{ mets: number }>> {
  const parsed = activitySchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0]?.message ?? "輸入無效" };

  const r = await ready();
  if ("error" in r) return { ok: false, error: r.error };

  try {
    const mets = await estimateMets(r.key, parsed.data.activity);
    if (!mets || mets <= 0)
      return { ok: false, error: "無法估算此運動，請手動輸入消耗" };
    return { ok: true, data: { mets } };
  } catch (e) {
    return { ok: false, error: mapError(e) };
  }
}
