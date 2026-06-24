import { cn } from "@/lib/cn";

type Macro = "protein" | "carbs" | "fat" | "fiber";

// Each macro gets a distinct solid fill (vs ProgressBar's brand gradient).
const MACRO: Record<Macro, { fill: string; text: string; label: string }> = {
  protein: { fill: "bg-blue", text: "text-blue", label: "蛋白質" },
  carbs: { fill: "bg-carbs", text: "text-carbs", label: "碳水" },
  fat: { fill: "bg-fat", text: "text-fat", label: "脂肪" },
  fiber: { fill: "bg-success", text: "text-success", label: "纖維" },
};

export interface MacroBarProps {
  macro: Macro;
  value: number;
  max: number;
  unit?: string;
  /** Override the default Chinese label. */
  label?: string;
}

export function MacroBar({
  macro,
  value,
  max,
  unit = "g",
  label,
}: MacroBarProps) {
  const { fill, text, label: defaultLabel } = MACRO[macro];
  const ratio = max > 0 ? value / max : 0;
  const pct = Math.min(100, Math.max(0, ratio * 100));

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <span className={cn("type-caption", text)}>
          {label ?? defaultLabel}
        </span>
        <span className="type-data-sm text-muted">
          {value} / {max} {unit}
        </span>
      </div>
      <div className="bg-line rounded-pill h-2 w-full overflow-hidden">
        <div
          className={cn(
            "rounded-pill h-full transition-[width] duration-500",
            fill,
          )}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
}
