"use client";

import { cn } from "@/lib/cn";

export interface CustomDateTimePickerProps {
  label?: string;
  /** Local datetime string "YYYY-MM-DDTHH:mm". Empty falls back to now. */
  value: string;
  onChange: (value: string) => void;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Parse "YYYY-MM-DDTHH:mm" (or any Date-parseable string) into parts. */
function parse(value: string) {
  const d = value ? new Date(value) : new Date();
  const base = Number.isNaN(d.getTime()) ? new Date() : d;
  return {
    year: base.getFullYear(),
    month: base.getMonth() + 1, // 1–12
    day: base.getDate(),
    hour: base.getHours(),
    minute: base.getMinutes(),
  };
}

const daysInMonth = (year: number, month: number) =>
  new Date(year, month, 0).getDate();

const range = (start: number, end: number) =>
  Array.from({ length: end - start + 1 }, (_, i) => start + i);

// Shared field styling — every field is h-12 for perfect alignment on
// iOS Safari / Chrome. font-mono per spec; base layer floors size to 16px.
const FIELD =
  "bg-card border-line h-12 appearance-none rounded-control border px-2 text-center font-mono focus:border-indigo focus-visible:outline-none focus:ring-2 focus:ring-indigo/30";

export function CustomDateTimePicker({
  label,
  value,
  onChange,
}: CustomDateTimePickerProps) {
  const p = parse(value);
  const thisYear = new Date().getFullYear();
  const years = range(thisYear - 5, thisYear + 1);
  const months = range(1, 12);
  const days = range(1, daysInMonth(p.year, p.month));
  const hours = range(0, 23);
  const minutes = range(0, 59);

  const emit = (next: Partial<typeof p>) => {
    const m = { ...p, ...next };
    // Clamp day if the new month/year has fewer days.
    const maxDay = daysInMonth(m.year, m.month);
    const day = Math.min(m.day, maxDay);
    onChange(
      `${m.year}-${pad(m.month)}-${pad(day)}T${pad(m.hour)}:${pad(m.minute)}`,
    );
  };

  return (
    <div>
      {label && (
        <span className="type-caption text-muted mb-1 block">{label}</span>
      )}
      <div className="grid grid-cols-3 gap-2">
        <select
          aria-label="年"
          className={cn(FIELD, "col-span-1")}
          value={p.year}
          onChange={(e) => emit({ year: Number(e.target.value) })}
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <select
          aria-label="月"
          className={FIELD}
          value={p.month}
          onChange={(e) => emit({ month: Number(e.target.value) })}
        >
          {months.map((m) => (
            <option key={m} value={m}>
              {pad(m)}
            </option>
          ))}
        </select>
        <select
          aria-label="日"
          className={FIELD}
          value={p.day}
          onChange={(e) => emit({ day: Number(e.target.value) })}
        >
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
          value={p.hour}
          onChange={(e) => emit({ hour: Number(e.target.value) })}
        >
          {hours.map((h) => (
            <option key={h} value={h}>
              {pad(h)} 時
            </option>
          ))}
        </select>
        <select
          aria-label="分"
          className={FIELD}
          value={p.minute}
          onChange={(e) => emit({ minute: Number(e.target.value) })}
        >
          {minutes.map((mi) => (
            <option key={mi} value={mi}>
              {pad(mi)} 分
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
