import { DeleteButton } from "@/components/app/DeleteButton";
import { DietClient } from "@/components/app/DietClient";
import { Badge, Card, SectionHeader } from "@/components/ui";
import { deleteDietLog } from "@/lib/data/actions";
import { listDietLogs, listFavoriteFoods } from "@/lib/data/queries";
import { taipeiDayRange, formatTime } from "@/lib/datetime";

export default async function DietPage() {
  const { from, to } = taipeiDayRange();
  const [today, favorites] = await Promise.all([
    listDietLogs({ from, to }),
    listFavoriteFoods(),
  ]);

  return (
    <div className="space-y-4">
      <DietClient favorites={favorites} />

      <Card>
        <SectionHeader title="今日飲食" />
        {today.length === 0 ? (
          <p className="type-caption text-muted py-4 text-center">
            今天還沒有飲食紀錄。
          </p>
        ) : (
          <ul className="divide-line mt-2 divide-y">
            {today.map((d) => (
              <li key={d.id} className="flex items-center gap-3 py-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="type-body-strong text-foreground truncate">
                      {d.name}
                    </span>
                    {d.category && <Badge tone="indigo">{d.category}</Badge>}
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
