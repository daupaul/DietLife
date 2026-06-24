import { formatMMDD } from "@/lib/datetime";

export interface WeightPoint {
  datetime: string;
  weight: number;
}

// viewBox geometry (layout coordinates, not design tokens).
const VBW = 320;
const VBH = 200;
const PAD_L = 34; // room for Y-axis (weight) labels
const PAD_R = 12;
const PAD_T = 18;
const PAD_B = 28;
const PLOT_W = VBW - PAD_L - PAD_R;
const PLOT_H = VBH - PAD_T - PAD_B;
const BOTTOM = PAD_T + PLOT_H;

/**
 * Weight trend line chart (spec §2.3): indigo stroke 3.5, white-bordered
 * blue node r=5, violet→indigo area gradient, auto-scaled Y axis with weight
 * (kg) tick labels + gridlines, MM/DD X axis. Pure SVG. Points ascending.
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

  const yTicks = range === 0 ? [min] : [max, (max + min) / 2, min];

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

  const step = Math.max(1, Math.ceil(n / 6));
  const showLabel = (i: number) => i % step === 0 || i === n - 1;

  return (
    <svg
      viewBox={`0 0 ${VBW} ${VBH}`}
      className="h-auto w-full"
      role="img"
      aria-label="體重趨勢圖（公斤）"
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

      {/* Y axis unit */}
      <text x={2} y={12} className="fill-subtle [font-size:9px]">
        kg
      </text>

      {/* Y gridlines + weight tick labels */}
      {yTicks.map((tv, i) => {
        const yy = y(tv);
        return (
          <g key={`ytick-${i}`}>
            <line
              x1={PAD_L}
              x2={PAD_L + PLOT_W}
              y1={yy}
              y2={yy}
              stroke="var(--color-line)"
              strokeWidth={1}
            />
            <text
              x={PAD_L - 4}
              y={yy + 3}
              textAnchor="end"
              className="fill-muted [font-size:9px]"
            >
              {tv.toFixed(1)}
            </text>
          </g>
        );
      })}

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
