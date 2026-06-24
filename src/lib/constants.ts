// Shared constants safe to import from both client and server (no deps).

export const MEAL_CATEGORIES = ["早餐", "午餐", "晚餐", "點心"] as const;
export type MealCategory = (typeof MEAL_CATEGORIES)[number];
