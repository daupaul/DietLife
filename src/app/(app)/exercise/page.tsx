import { DeleteButton } from "@/components/app/DeleteButton";
import { ExerciseForm } from "@/components/app/ExerciseForm";
import { Card, SectionHeader } from "@/components/ui";
import { deleteExerciseLog } from "@/lib/data/actions";
import { listExerciseLogs } from "@/lib/data/queries";
import { taipeiDayRange, formatTime } from "@/lib/datetime";

export default async function ExercisePage() {
  const { from, to } = taipeiDayRange();
  const today = await listExerciseLogs({ from, to });

  return (
    <div className="space-y-4">
      <ExerciseForm />

      <Card>
        <SectionHeader title="今日運動" />
        {today.length === 0 ? (
          <p className="type-caption text-muted py-4 text-center">
            今天還沒有運動紀錄。
          </p>
        ) : (
          <ul className="divide-line mt-2 divide-y">
            {today.map((e) => (
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
