export interface CalorieRingProps {
  remaining: number;
  pct: number; // 0–100 achievement
}

const R = 92;
const C = 2 * Math.PI * R;

/**
 * Hero calorie ring — the dashboard's single focal point. Sage progress arc
 * on a soft track, with the remaining figure as a large serif numeral centred.
 */
export function CalorieRing({ remaining, pct }: CalorieRingProps) {
  const clamped = Math.min(100, Math.max(0, pct));
  const offset = C * (1 - clamped / 100);

  return (
    <div className="relative mx-auto aspect-square w-56">
      <svg viewBox="0 0 220 220" className="size-full -rotate-90">
        <circle
          cx={110}
          cy={110}
          r={R}
          fill="none"
          stroke="var(--color-accent-soft)"
          strokeWidth={14}
        />
        <circle
          cx={110}
          cy={110}
          r={R}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth={14}
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="type-overline text-muted">剩餘可攝取</span>
        <span className="type-hero-num text-foreground mt-1">{remaining}</span>
        <span className="type-caption text-muted mt-1">
          kcal · 達標 {Math.round(pct)}%
        </span>
      </div>
    </div>
  );
}
