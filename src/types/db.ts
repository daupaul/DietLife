// Hand-written row types mirroring supabase/migrations/20260624000001_init.sql.
// (Can later be replaced by `supabase gen types typescript`.)

export type Gender = "male" | "female";

/** profiles row WITHOUT the server-only secret (what client/RSC may read). */
export interface Profile {
  id: string;
  gender: Gender | null;
  age: number | null;
  height: number | null; // cm
  weight: number | null; // kg
  activity_level: number | null; // TDEE multiplier
  daily_calorie_goal: number | null;
  protein_goal: number | null;
  carbs_goal: number | null;
  fat_goal: number | null;
  fiber_goal: number | null;
  sodium_goal: number | null;
  created_at: string;
  updated_at: string;
}

export interface WeightLog {
  id: string;
  user_id: string;
  datetime: string;
  weight: number;
  created_at: string;
}

export interface DietLog {
  id: string;
  user_id: string;
  datetime: string;
  name: string;
  category: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number;
  image: string | null;
  created_at: string;
}

export interface ExerciseLog {
  id: string;
  user_id: string;
  datetime: string;
  type: string;
  duration: number | null; // minutes
  calories_burned: number;
  created_at: string;
}

export interface FavoriteFood {
  id: string;
  user_id: string;
  name: string;
  category: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number;
  created_at: string;
}
