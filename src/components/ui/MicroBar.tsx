import { cn } from "@/lib/cn";

type Tone = "neutral" | "success" | "danger";

const TONE: Record<Tone, string> = {
  neutral: "bg-accent",
  success: "bg-success",
  danger: "bg-danger",
};

export interface MicroBarProps {
  label: string;
  value: number;
  max: number;
  unit?: string;
  tone?: Tone;
  /** When over goal, pulse + switch to danger tone (e.g. sodium). */
  warn?: boolean;
}

/** Compact bar for secondary nutrients (fibre, sodium, …). */
export function MicroBar({
  label,
  value,
  max,
  unit,
  tone = "neutral",
  warn,
}: MicroBarProps) {
  const ratio = max > 0 ? value / max : 0;
  const pct = Math.min(100, Math.max(0, ratio * 100));
  const isWarn = warn ?? false;
  const fill = isWarn ? TONE.danger : TONE[tone];

  return (
    <div>
      <div className="mb-0.5 flex items-baseline justify-between">
        <span className="type-caption text-muted">{label}</span>
        <span
          className={cn(
            "type-data-sm",
            isWarn ? "text-danger" : "text-foreground",
          )}
        >
          {value} / {max}
          {unit ? ` ${unit}` : ""}
        </span>
      </div>
      <div className="bg-line rounded-pill h-1.5 w-full overflow-hidden">
        <div
          className={cn(
            "rounded-pill h-full transition-[width] duration-500",
            fill,
            isWarn && "animate-pulse",
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
