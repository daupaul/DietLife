import { z } from "zod";
import { MEAL_CATEGORIES } from "@/lib/constants";

// Local datetime string from CustomDateTimePicker ("YYYY-MM-DDTHH:mm") or any
// Date-parseable value. Server converts to ISO before persisting.
const datetimeString = z
  .string()
  .refine((v) => !Number.isNaN(Date.parse(v)), { message: "無效的日期時間" });

// Reusable non-negative nutrient value (coerced from string form fields).
const nutrient = z.coerce.number().min(0).max(100000);
const category = z.enum(MEAL_CATEGORIES).nullable().optional();

// ── auth ────────────────────────────────────────────────────────
export const credentialsSchema = z.object({
  email: z.string().email("請輸入有效的電子郵件").max(254),
  password: z.string().min(8, "密碼至少 8 碼").max(72),
});
export type CredentialsInput = z.infer<typeof credentialsSchema>;

// ── profile ─────────────────────────────────────────────────────
export const profileSchema = z.object({
  gender: z.enum(["male", "female"]).nullable().optional(),
  age: z.coerce.number().int().min(1).max(149).nullable().optional(),
  height: z.coerce.number().min(1).max(300).nullable().optional(), // cm
  weight: z.coerce.number().min(1).max(500).nullable().optional(), // kg
  activity_level: z.coerce.number().min(1).max(3).nullable().optional(),
  daily_calorie_goal: z.coerce
    .number()
    .int()
    .min(0)
    .max(20000)
    .nullable()
    .optional(),
  protein_goal: z.coerce.number().int().min(0).max(2000).nullable().optional(),
  carbs_goal: z.coerce.number().int().min(0).max(2000).nullable().optional(),
  fat_goal: z.coerce.number().int().min(0).max(2000).nullable().optional(),
  fiber_goal: z.coerce.number().int().min(0).max(500).nullable().optional(),
  sodium_goal: z.coerce.number().int().min(0).max(20000).nullable().optional(),
});
export type ProfileInput = z.infer<typeof profileSchema>;

// gemini key handled separately (server-only). Length-bounded, trimmed.
export const geminiKeySchema = z.object({
  apiKey: z.string().trim().min(10, "金鑰太短").max(200),
});

// ── weight ──────────────────────────────────────────────────────
export const weightLogSchema = z.object({
  datetime: datetimeString,
  weight: z.coerce.number().min(1).max(500),
});
export type WeightLogInput = z.infer<typeof weightLogSchema>;

// ── diet ────────────────────────────────────────────────────────
export const dietLogSchema = z.object({
  datetime: datetimeString,
  name: z.string().trim().min(1, "請輸入名稱").max(200),
  category,
  calories: nutrient,
  protein: nutrient,
  carbs: nutrient,
  fat: nutrient,
  fiber: nutrient,
  sodium: nutrient,
  image: z.string().url().max(2048).nullable().optional(),
});
export type DietLogInput = z.infer<typeof dietLogSchema>;

// ── exercise ────────────────────────────────────────────────────
export const exerciseLogSchema = z.object({
  datetime: datetimeString,
  type: z.string().trim().min(1, "請輸入運動類型").max(100),
  duration: z.coerce.number().int().min(0).max(1440).nullable().optional(),
  calories_burned: nutrient,
});
export type ExerciseLogInput = z.infer<typeof exerciseLogSchema>;

// ── favorite food ───────────────────────────────────────────────
export const favoriteFoodSchema = z.object({
  name: z.string().trim().min(1, "請輸入名稱").max(200),
  category,
  calories: nutrient,
  protein: nutrient,
  carbs: nutrient,
  fat: nutrient,
  fiber: nutrient,
  sodium: nutrient,
});
export type FavoriteFoodInput = z.infer<typeof favoriteFoodSchema>;

export const idSchema = z.string().uuid();
