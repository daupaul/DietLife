import { DeleteButton } from "@/components/app/DeleteButton";
import { WeightChart } from "@/components/app/WeightChart";
import { WeightForm } from "@/components/app/WeightForm";
import { Card, SectionHeader } from "@/components/ui";
import { deleteWeightLog } from "@/lib/data/actions";
import { listWeightLogs } from "@/lib/data/queries";
import { formatDateTime } from "@/lib/datetime";

export default async function WeightPage() {
  const logs = await listWeightLogs(90);

  return (
    <div className="space-y-4">
      <Card>
        <SectionHeader title="體重趨勢" />
        <div className="mt-3">
          {logs.length > 0 ? (
            <WeightChart
              points={logs.map((l) => ({
                datetime: l.datetime,
                weight: l.weight,
              }))}
            />
          ) : (
            <p className="type-body text-muted py-8 text-center">
              還沒有體重紀錄，從下方新增第一筆。
            </p>
          )}
        </div>
      </Card>

      <WeightForm />

      {logs.length > 0 && (
        <Card>
          <SectionHeader title="紀錄" />
          <ul className="divide-line mt-2 divide-y">
            {logs.map((l) => (
              <li key={l.id} className="flex items-center gap-3 py-2">
                <span className="type-data-md text-foreground w-24">
                  {l.weight}
                  <span className="type-caption text-muted"> kg</span>
                </span>
                <span className="type-caption text-muted flex-1">
                  {formatDateTime(l.datetime)}
                </span>
                <DeleteButton id={l.id} action={deleteWeightLog} />
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
