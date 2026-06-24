import Link from "next/link";
import { Flame, Footprints, Target, Utensils } from "lucide-react";
import {
  Button,
  Card,
  MacroBar,
  MicroBar,
  ProgressBar,
  SectionHeader,
  StatCard,
} from "@/components/ui";
import { getProfile, listDietLogs, listExerciseLogs } from "@/lib/data/queries";
import {
  dayRangeForDateStr,
  formatDayLabel,
  isValidDateStr,
  shiftDateStr,
  taipeiTodayStr,
} from "@/lib/datetime";
import { DayNav } from "@/components/app/DayNav";
import {
  achievementPct,
  bmr,
  dynamicTdee,
  remainingCalories,
  sumField,
} from "@/lib/calc/nutrition";

const r = Math.round;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const sp = await searchParams;
  const today = taipeiTodayStr();
  const date = isValidDateStr(sp.date) && sp.date <= today ? sp.date : today;
  const isToday = date === today;
  const { from, to } = dayRangeForDateStr(date);

  const [profile, diet, exercise] = await Promise.all([
    getProfile(),
    listDietLogs({ from, to }),
    listExerciseLogs({ from, to }),
  ]);

  const intake = sumField(diet, "calories");
  const burn = sumField(exercise, "calories_burned");

  const dayNav = (
    <DayNav
      label={formatDayLabel(date)}
      prevDate={shiftDateStr(date, -1)}
      nextDate={shiftDateStr(date, 1)}
      isToday={isToday}
    />
  );

  const complete = Boolean(
    profile?.gender &&
    profile.age &&
    profile.height &&
    profile.weight &&
    profile.activity_level &&
    profile.daily_calorie_goal,
  );

  if (!complete) {
    return (
      <div className="space-y-4">
        {dayNav}
        <Card size="lg">
          <h2 className="type-h2 text-foreground">先完成個人設定</h2>
          <p className="type-body text-muted mt-2">
            填好性別、年齡、身高體重、活動量與每日熱量目標，儀表板才能算出
            BMR、TDEE 與剩餘可攝取熱量。
          </p>
          <Link href="/settings" className="mt-4 block">
            <Button fullWidth>前往設定</Button>
          </Link>
        </Card>

        <Card>
          <p className="type-caption text-muted">今日已記錄</p>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <StatCard
              variant="intake"
              label="攝取"
              value={r(intake)}
              unit="kcal"
            />
            <StatCard
              variant="exercise"
              label="運動消耗"
              value={r(burn)}
              unit="kcal"
            />
          </div>
        </Card>
      </div>
    );
  }

  // profile is complete here
  const bmrValue = bmr({
    gender: profile!.gender!,
    weightKg: profile!.weight!,
    heightCm: profile!.height!,
    age: profile!.age!,
  });
  const goal = profile!.daily_calorie_goal!;
  const tdee = dynamicTdee(bmrValue, profile!.activity_level!, burn);
  const cap = goal + burn;
  const remaining = remainingCalories(goal, burn, intake);
  const pct = achievementPct(intake, goal, burn);

  // macro/fibre/sodium totals
  const protein = sumField(diet, "protein");
  const carbs = sumField(diet, "carbs");
  const fat = sumField(diet, "fat");
  const fiber = sumField(diet, "fiber");
  const sodium = sumField(diet, "sodium");

  return (
    <div className="space-y-4">
      {dayNav}
      {/* Energy balance */}
      <Card size="lg">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-baseline justify-between gap-4">
              <span className="type-caption text-muted">目標攝取</span>
              <span className="type-data-sm text-foreground">{r(goal)}</span>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <span className="type-caption text-muted">+ 運動增額</span>
              <span className="type-data-sm text-sport">+{r(burn)}</span>
            </div>
            <div className="border-line flex items-baseline justify-between gap-4 border-t pt-1">
              <span className="type-caption text-muted">可攝取上限</span>
              <span className="type-data-sm text-foreground">{r(cap)}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="type-data-lg text-indigo">{r(remaining)}</div>
            <div className="type-caption text-muted">剩餘可攝取 kcal</div>
          </div>
        </div>
        <div className="mt-4">
          <ProgressBar
            label={`達標 ${r(pct)}%`}
            value={r(intake)}
            max={r(cap)}
            readout={`${r(intake)} / ${r(cap)} kcal`}
          />
        </div>
      </Card>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          variant="bmr"
          label="BMR"
          value={r(bmrValue)}
          unit="kcal"
          icon={<Flame className="size-4" strokeWidth={2.5} />}
        />
        <StatCard
          variant="tdee"
          label="動態 TDEE"
          value={r(tdee)}
          unit="kcal"
          icon={<Target className="size-4" strokeWidth={2.5} />}
        />
        <StatCard
          variant="intake"
          label="攝取"
          value={r(intake)}
          unit="kcal"
          icon={<Utensils className="size-4" strokeWidth={2.5} />}
        />
        <StatCard
          variant="exercise"
          label="運動消耗"
          value={r(burn)}
          unit="kcal"
          icon={<Footprints className="size-4" strokeWidth={2.5} />}
        />
      </div>

      {/* Macros / micros */}
      <Card>
        <SectionHeader title="營養素" />
        <div className="mt-3 space-y-3">
          {profile!.protein_goal ? (
            <MacroBar
              macro="protein"
              value={r(protein)}
              max={profile!.protein_goal}
            />
          ) : null}
          {profile!.carbs_goal ? (
            <MacroBar
              macro="carbs"
              value={r(carbs)}
              max={profile!.carbs_goal}
            />
          ) : null}
          {profile!.fat_goal ? (
            <MacroBar macro="fat" value={r(fat)} max={profile!.fat_goal} />
          ) : null}
          {profile!.fiber_goal ? (
            <MacroBar
              macro="fiber"
              value={r(fiber)}
              max={profile!.fiber_goal}
            />
          ) : null}
          {profile!.sodium_goal ? (
            <div className="border-line border-t pt-3">
              <MicroBar
                label="鈉"
                value={r(sodium)}
                max={profile!.sodium_goal}
                unit="mg"
                warn={sodium > profile!.sodium_goal}
              />
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
