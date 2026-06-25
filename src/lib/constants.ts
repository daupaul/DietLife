// Shared constants safe to import from both client and server (no deps).

export const MEAL_CATEGORIES = ["早餐", "午餐", "晚餐", "點心"] as const;
export type MealCategory = (typeof MEAL_CATEGORIES)[number];

// Exercise types → METs (metabolic equivalent). kcal = METs × kg × hours.
export const EXERCISE_METS: Record<string, number> = {
  重訓: 3.5,
  腳踏車: 4.0,
  爬坡: 6.0,
  慢走: 3.0,
  快走: 5.0,
  瑜珈: 2.5,
  皮拉提斯: 3.5,
  飛輪: 6.5,
};

export const EXERCISE_TYPES = Object.keys(EXERCISE_METS);
export const EXERCISE_OTHER = "其他";
