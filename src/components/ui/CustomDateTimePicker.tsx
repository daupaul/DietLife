"use client";

import { cn } from "@/lib/cn";

export interface CustomDateTimePickerProps {
  label?: string;
  /** Local datetime string "YYYY-MM-DDTHH:mm". Empty renders placeholders. */
  value: string;
  onChange: (value: string) => void;
}

interface Parts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Parse "YYYY-MM-DDTHH:mm" into parts, or null when empty/invalid
 *  (deterministic — never falls back to `new Date()`, so SSR == CSR). */
function parse(value: string): Parts | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: d.getDate(),
    hour: d.getHours(),
    minute: d.getMinutes(),
  };
}

function nowParts(): Parts {
  const d = new Date();
  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: d.getDate(),
    hour: d.getHours(),
    minute: d.getMinutes(),
  };
}

const daysInMonth = (year: number, month: number) =>
  new Date(year, month, 0).getDate();

const range = (start: number, end: number) =>
  Array.from({ length: end - start + 1 }, (_, i) => start + i);

// Every field is h-12 for perfect alignment on iOS Safari / Chrome.
const FIELD =
  "bg-card border-line h-12 appearance-none rounded-control border px-2 text-center tabular-nums focus:border-accent focus-visible:outline-none focus:ring-2 focus:ring-accent/30";

export function CustomDateTimePicker({
  label,
  value,
  onChange,
}: CustomDateTimePickerProps) {
  const p = parse(value);
  const thisYear = new Date().getFullYear();
  const years = range(thisYear - 5, thisYear + 5);
  const days = range(1, daysInMonth(p?.year ?? thisYear, p?.month ?? 1));

  // First interaction from an empty state seeds "now" then applies the change.
  const emit = (next: Partial<Parts>) => {
    const base = p ?? nowParts();
    const m = { ...base, ...next };
    const day = Math.min(m.day, daysInMonth(m.year, m.month));
    onChange(
      `${m.year}-${pad(m.month)}-${pad(day)}T${pad(m.hour)}:${pad(m.minute)}`,
    );
  };

  const sel = (v: number | undefined) => (v === undefined ? "" : v);

  return (
    <div>
      {label && (
        <span className="type-caption text-muted mb-1 block">{label}</span>
      )}
      <div className="grid grid-cols-3 gap-2">
        <select
          aria-label="年"
          className={cn(FIELD, "col-span-1")}
          value={sel(p?.year)}
          onChange={(e) => emit({ year: Number(e.target.value) })}
        >
          {!p && (
            <option value="" disabled>
              年
            </option>
          )}
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <select
          aria-label="月"
          className={FIELD}
          value={sel(p?.month)}
          onChange={(e) => emit({ month: Number(e.target.value) })}
        >
          {!p && (
            <option value="" disabled>
              月
            </option>
          )}
          {range(1, 12).map((m) => (
            <option key={m} value={m}>
              {pad(m)}
            </option>
          ))}
        </select>
        <select
          aria-label="日"
          className={FIELD}
          value={sel(p?.day)}
          onChange={(e) => emit({ day: Number(e.target.value) })}
        >
          {!p && (
            <option value="" disabled>
              日
            </option>
          )}
          {days.map((d) => (
            <option key={d} value={d}>
              {pad(d)}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <select
          aria-label="時"
          className={FIELD}
          value={sel(p?.hour)}
          onChange={(e) => emit({ hour: Number(e.target.value) })}
        >
          {!p && (
            <option value="" disabled>
              時
            </option>
          )}
          {range(0, 23).map((h) => (
            <option key={h} value={h}>
              {pad(h)} 時
            </option>
          ))}
        </select>
        <select
          aria-label="分"
          className={FIELD}
          value={sel(p?.minute)}
          onChange={(e) => emit({ minute: Number(e.target.value) })}
        >
          {!p && (
            <option value="" disabled>
              分
            </option>
          )}
          {range(0, 59).map((mi) => (
            <option key={mi} value={mi}>
              {pad(mi)} 分
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
