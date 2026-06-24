import { DayNav } from "@/components/app/DayNav";
import { DeleteButton } from "@/components/app/DeleteButton";
import { DietClient } from "@/components/app/DietClient";
import { Badge, Card, SectionHeader } from "@/components/ui";
import { deleteDietLog } from "@/lib/data/actions";
import { listDietLogs, listFavoriteFoods } from "@/lib/data/queries";
import {
  dayRangeForDateStr,
  formatDayLabel,
  formatTime,
  isValidDateStr,
  shiftDateStr,
  taipeiTodayStr,
} from "@/lib/datetime";

export default async function DietPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const sp = await searchParams;
  const today = taipeiTodayStr();
  const date = isValidDateStr(sp.date) && sp.date <= today ? sp.date : today;
  const isToday = date === today;
  const { from, to } = dayRangeForDateStr(date);

  const [logs, favorites] = await Promise.all([
    listDietLogs({ from, to }),
    listFavoriteFoods(),
  ]);

  return (
    <div className="space-y-4">
      <DietClient favorites={favorites} />

      <DayNav
        label={formatDayLabel(date)}
        prevDate={shiftDateStr(date, -1)}
        nextDate={shiftDateStr(date, 1)}
        isToday={isToday}
      />

      <Card>
        <SectionHeader title={`${formatDayLabel(date)}飲食`} />
        {logs.length === 0 ? (
          <p className="type-caption text-muted py-4 text-center">
            這天沒有飲食紀錄。
          </p>
        ) : (
          <ul className="divide-line mt-2 divide-y">
            {logs.map((d) => (
              <li key={d.id} className="flex items-center gap-3 py-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="type-body-strong text-foreground truncate">
                      {d.name}
                    </span>
                    {d.category && <Badge tone="accent">{d.category}</Badge>}
                  </div>
                  <span className="type-caption text-muted">
                    {formatTime(d.datetime)} · {Math.round(d.calories)} kcal
                  </span>
                </div>
                <DeleteButton id={d.id} action={deleteDietLog} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
