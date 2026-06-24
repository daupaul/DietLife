import { cn } from "@/lib/cn";

export interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  /** Right-aligned readout, e.g. "1850 / 2000 kcal". Defaults to value/max. */
  readout?: string;
  /**
   * Warning state (e.g. sodium over goal): fill turns rose + pulses and a
   * warning line shows. Auto-on when value > max unless explicitly set false.
   */
  warn?: boolean;
  warnText?: string;
}

export function ProgressBar({
  value,
  max,
  label,
  readout,
  warn,
  warnText,
}: ProgressBarProps) {
  // Guard divide-by-zero; clamp fill to 0–100%.
  const ratio = max > 0 ? value / max : 0;
  const pct = Math.min(100, Math.max(0, ratio * 100));
  const isWarn = warn ?? value > max;

  return (
    <div>
      {(label || readout) && (
        <div className="mb-1 flex items-baseline justify-between">
          {label ? (
            <span className="type-caption text-muted">{label}</span>
          ) : (
            <span />
          )}
          {readout ? (
            <span className="type-data-sm text-foreground">{readout}</span>
          ) : (
            <span className="type-data-sm text-muted">
              {value} / {max}
            </span>
          )}
        </div>
      )}
      <div className="bg-line rounded-pill h-2.5 w-full overflow-hidden">
        <div
          className={cn(
            "rounded-pill h-full transition-[width] duration-500",
            isWarn ? "bg-danger animate-pulse" : "bg-accent",
          )}
          // Dynamic geometry only — not a design value. All colours/sizing
          // still come from tokens above.
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
      {isWarn && (
        <p className="text-danger type-caption mt-1">
          {warnText ?? "已超過建議攝取量"}
        </p>
      )}
    </div>
  );
}
