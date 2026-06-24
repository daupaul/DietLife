import { formatMMDD } from "@/lib/datetime";

export interface WeightPoint {
  datetime: string;
  weight: number;
}

// viewBox geometry (these are layout coordinates, not design tokens).
const VBW = 320;
const VBH = 200;
const PAD_L = 12;
const PAD_R = 12;
const PAD_T = 16;
const PAD_B = 28;
const PLOT_W = VBW - PAD_L - PAD_R;
const PLOT_H = VBH - PAD_T - PAD_B;
const BOTTOM = PAD_T + PLOT_H;

/**
 * Weight trend line chart (spec §2.3): indigo stroke 3.5, white-bordered
 * blue node r=5, violet→indigo area gradient, Y axis auto-scaled to extremes,
 * X axis MM/DD. Pure SVG, no client JS. Expects points ascending by time.
 */
export function WeightChart({ points }: { points: WeightPoint[] }) {
  const data = [...points].sort(
    (a, b) => Date.parse(a.datetime) - Date.parse(b.datetime),
  );
  const n = data.length;

  const weights = data.map((d) => d.weight);
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const range = max - min;
  const lo = range === 0 ? min - 1 : min - range * 0.15;
  const hi = range === 0 ? max + 1 : max + range * 0.15;

  const x = (i: number) =>
    n <= 1 ? PAD_L + PLOT_W / 2 : PAD_L + (PLOT_W * i) / (n - 1);
  const y = (w: number) => PAD_T + PLOT_H * (1 - (w - lo) / (hi - lo));

  const coords = data.map((d, i) => ({ cx: x(i), cy: y(d.weight), d }));
  const linePath = coords
    .map(
      (c, i) => `${i === 0 ? "M" : "L"} ${c.cx.toFixed(1)} ${c.cy.toFixed(1)}`,
    )
    .join(" ");
  const areaPath =
    n > 1
      ? `M ${coords[0].cx.toFixed(1)} ${BOTTOM} ` +
        coords.map((c) => `L ${c.cx.toFixed(1)} ${c.cy.toFixed(1)}`).join(" ") +
        ` L ${coords[n - 1].cx.toFixed(1)} ${BOTTOM} Z`
      : "";

  // Label up to ~6 X ticks (always include the last point).
  const step = Math.max(1, Math.ceil(n / 6));
  const showLabel = (i: number) => i % step === 0 || i === n - 1;

  return (
    <svg
      viewBox={`0 0 ${VBW} ${VBH}`}
      className="h-auto w-full"
      role="img"
      aria-label="體重趨勢圖"
    >
      <defs>
        <linearGradient id="weightArea" x1="0" y1="0" x2="0" y2="1">
          <stop
            offset="0%"
            stopColor="var(--color-violet)"
            stopOpacity="0.28"
          />
          <stop offset="100%" stopColor="var(--color-indigo)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {areaPath && <path d={areaPath} fill="url(#weightArea)" />}

      <path
        d={linePath}
        fill="none"
        stroke="var(--color-indigo)"
        strokeWidth={3.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {coords.map((c, i) => (
        <g key={c.d.datetime + i}>
          <circle
            cx={c.cx}
            cy={c.cy}
            r={5}
            fill="var(--color-blue)"
            stroke="#ffffff"
            strokeWidth={2}
          />
          {showLabel(i) && (
            <text
              x={c.cx}
              y={VBH - 8}
              textAnchor="middle"
              className="fill-muted [font-size:10px]"
            >
              {formatMMDD(c.d.datetime)}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}
