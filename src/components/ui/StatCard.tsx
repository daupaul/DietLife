import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type StatVariant = "bmr" | "tdee" | "intake" | "exercise";

// Four soft-tinted variants per spec §2.1 (BMR / TDEE / 攝取 / 運動).
const STAT: Record<StatVariant, { bg: string; accent: string }> = {
  bmr: { bg: "bg-indigo-bg", accent: "text-indigo" },
  tdee: { bg: "bg-violet-bg", accent: "text-violet" },
  intake: { bg: "bg-blue-bg", accent: "text-blue" },
  exercise: { bg: "bg-sport-bg", accent: "text-sport" },
};

export interface StatCardProps {
  variant: StatVariant;
  label: string;
  value: number | string;
  unit?: string;
  icon?: ReactNode;
}

export function StatCard({ variant, label, value, unit, icon }: StatCardProps) {
  const { bg, accent } = STAT[variant];
  return (
    <div className={cn("rounded-card p-4", bg)}>
      <div className="flex items-center justify-between">
        <span className="type-caption text-muted">{label}</span>
        {icon ? <span className={accent}>{icon}</span> : null}
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className={cn("type-data-md", accent)}>{value}</span>
        {unit ? <span className="type-caption text-muted">{unit}</span> : null}
      </div>
    </div>
  );
}
