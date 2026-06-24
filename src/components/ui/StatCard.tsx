import type { ReactNode } from "react";

// Variant kept for API compatibility / future per-stat theming; the editorial
// system keeps all four cards calm and uniform (accent as punctuation only).
type StatVariant = "bmr" | "tdee" | "intake" | "exercise";

export interface StatCardProps {
  variant?: StatVariant;
  label: string;
  value: number | string;
  unit?: string;
  icon?: ReactNode;
}

export function StatCard({ label, value, unit, icon }: StatCardProps) {
  return (
    <div className="bg-card border-line rounded-card border p-4">
      <div className="flex items-center justify-between">
        <span className="type-caption text-muted">{label}</span>
        {icon ? (
          <span className="bg-accent-soft text-accent flex size-7 items-center justify-center rounded-xl">
            {icon}
          </span>
        ) : null}
      </div>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="type-data-md text-foreground">{value}</span>
        {unit ? <span className="type-caption text-muted">{unit}</span> : null}
      </div>
    </div>
  );
}
