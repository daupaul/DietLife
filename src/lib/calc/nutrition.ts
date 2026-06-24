// Pure nutrition/energy calculations (spec §4). No I/O, no UI — fully testable.

export type Gender = "male" | "female";

export interface BmrInput {
  gender: Gender;
  weightKg: number;
  heightCm: number;
  age: number;
}

/** Basal Metabolic Rate — Mifflin-St Jeor (by gender). */
export function bmr({ gender, weightKg, heightCm, age }: BmrInput): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return gender === "female" ? base - 161 : base + 5;
}

/** Dynamic TDEE = BMR × activityLevel + today's exercise burn (Y). */
export function dynamicTdee(
  bmrValue: number,
  activityLevel: number,
  exerciseBurn: number,
): number {
  return bmrValue * activityLevel + exerciseBurn;
}

/**
 * Remaining calories R = max(0, dailyGoal + exerciseBurn − intake).
 * Core behaviour: exercise refunds headroom; never goes negative.
 */
export function remainingCalories(
  dailyGoal: number,
  exerciseBurn: number,
  intake: number,
): number {
  return Math.max(0, dailyGoal + exerciseBurn - intake);
}

/**
 * Achievement % = min(100, intake / (dailyGoal + exerciseBurn) × 100).
 * Guards divide-by-zero (no/zero goal → 0%).
 */
export function achievementPct(
  intake: number,
  dailyGoal: number,
  exerciseBurn: number,
): number {
  const denom = dailyGoal + exerciseBurn;
  if (denom <= 0) return 0;
  return Math.min(100, (intake / denom) * 100);
}

/** Remaining amount for a macro/fibre goal = max(0, goal − consumed). */
export function remainingNutrient(goal: number, consumed: number): number {
  return Math.max(0, goal - consumed);
}

/** Sum a numeric field across rows (e.g. today's calories / burn). */
export function sumField<T>(rows: readonly T[], key: keyof T): number {
  return rows.reduce((acc, row) => {
    const v = row[key];
    return acc + (typeof v === "number" ? v : 0);
  }, 0);
}
