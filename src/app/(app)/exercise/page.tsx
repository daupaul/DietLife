import { DayNav } from "@/components/app/DayNav";
import { DeleteButton } from "@/components/app/DeleteButton";
import { ExerciseForm } from "@/components/app/ExerciseForm";
import { Card, SectionHeader } from "@/components/ui";
import { deleteExerciseLog } from "@/lib/data/actions";
import { getProfile, listExerciseLogs } from "@/lib/data/queries";
import {
  dayRangeForDateStr,
  formatDayLabel,
  formatTime,
  isValidDateStr,
  shiftDateStr,
  taipeiTodayStr,
} from "@/lib/datetime";

export default async function ExercisePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const sp = await searchParams;
  const today = taipeiTodayStr();
  const date = isValidDateStr(sp.date) && sp.date <= today ? sp.date : today;
  const isToday = date === today;
  const { from, to } = dayRangeForDateStr(date);

  const [logs, profile] = await Promise.all([
    listExerciseLogs({ from, to }),
    getProfile(),
  ]);

  return (
    <div className="space-y-4">
      <ExerciseForm weightKg={profile?.weight ?? null} />

      <DayNav
        label={formatDayLabel(date)}
        prevDate={shiftDateStr(date, -1)}
        nextDate={shiftDateStr(date, 1)}
        isToday={isToday}
      />

      <Card>
        <SectionHeader title={`${formatDayLabel(date)}運動`} />
        {logs.length === 0 ? (
          <p className="type-caption text-muted py-4 text-center">
            這天沒有運動紀錄。
          </p>
        ) : (
          <ul className="divide-line mt-2 divide-y">
            {logs.map((e) => (
              <li key={e.id} className="flex items-center gap-3 py-2">
                <div className="min-w-0 flex-1">
                  <span className="type-body-strong text-foreground block truncate">
                    {e.type}
                  </span>
                  <span className="type-caption text-muted">
                    {formatTime(e.datetime)}
                    {e.duration ? ` · ${e.duration} 分` : ""} ·{" "}
                    {Math.round(e.calories_burned)} kcal
                  </span>
                </div>
                <DeleteButton id={e.id} action={deleteExerciseLog} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
