"use server";

import { z } from "zod";
import { getUser } from "@/lib/auth/user";
import { getGeminiApiKey } from "@/lib/data/queries";
import { allowRequest } from "@/lib/gemini/ratelimit";
import {
  GeminiError,
  estimateFood as runEstimate,
  estimateMets,
  type NutritionEstimate,
} from "@/lib/gemini/estimate";
import type { ActionResult } from "./types";

const activitySchema = z.object({
  activity: z.string().trim().min(1, "請輸入運動項目").max(100),
});

// Text and/or photo (both together is most accurate). At least one required.
const estimateSchema = z
  .object({
    description: z.string().trim().max(500).optional(),
    mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]).optional(),
    base64: z.string().max(8_000_000).optional(), // resized client-side
  })
  .refine((d) => (d.description && d.description.length > 0) || !!d.base64, {
    message: "請輸入描述或附上照片",
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

export async function estimateFood(
  input: unknown,
): Promise<ActionResult<NutritionEstimate>> {
  const parsed = estimateSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0]?.message ?? "輸入無效" };

  const r = await ready();
  if ("error" in r) return { ok: false, error: r.error };

  const { description, base64, mimeType } = parsed.data;
  try {
    const data = await runEstimate(r.key, {
      description,
      image: base64
        ? { base64, mimeType: mimeType ?? "image/jpeg" }
        : undefined,
    });
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
