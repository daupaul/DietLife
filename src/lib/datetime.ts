// "Today" boundaries and formatting use Taiwan time (UTC+8, no DST) so the
// dashboard's daily totals match the user's local day deterministically on
// the server. (If multi-timezone support is ever needed, store a per-user tz.)

const TPE_OFFSET_MS = 8 * 60 * 60 * 1000;
const TPE = "Asia/Taipei";
const DAY_MS = 24 * 60 * 60 * 1000;
const pad = (n: number) => String(n).padStart(2, "0");

/** UTC [from, to) ISO range covering the Taipei calendar day of `nowMs`. */
export function taipeiDayRange(nowMs: number = Date.now()): {
  from: string;
  to: string;
} {
  const shifted = new Date(nowMs + TPE_OFFSET_MS);
  const startUtc =
    Date.UTC(
      shifted.getUTCFullYear(),
      shifted.getUTCMonth(),
      shifted.getUTCDate(),
    ) - TPE_OFFSET_MS;
  return {
    from: new Date(startUtc).toISOString(),
    to: new Date(startUtc + DAY_MS).toISOString(),
  };
}

/** Current Taipei wall time as a datetime-local string "YYYY-MM-DDTHH:mm". */
export function taipeiNowInput(nowMs: number = Date.now()): string {
  const s = new Date(nowMs + TPE_OFFSET_MS);
  return `${s.getUTCFullYear()}-${pad(s.getUTCMonth() + 1)}-${pad(
    s.getUTCDate(),
  )}T${pad(s.getUTCHours())}:${pad(s.getUTCMinutes())}`;
}

/** Today's Taipei calendar date as "YYYY-MM-DD". */
export function taipeiTodayStr(nowMs: number = Date.now()): string {
  const s = new Date(nowMs + TPE_OFFSET_MS);
  return `${s.getUTCFullYear()}-${pad(s.getUTCMonth() + 1)}-${pad(s.getUTCDate())}`;
}

/** UTC [from, to) range for a given Taipei calendar date "YYYY-MM-DD". */
export function dayRangeForDateStr(dateStr: string): {
  from: string;
  to: string;
} {
  const [y, m, d] = dateStr.split("-").map(Number);
  const startUtc = Date.UTC(y, m - 1, d) - TPE_OFFSET_MS;
  return {
    from: new Date(startUtc).toISOString(),
    to: new Date(startUtc + DAY_MS).toISOString(),
  };
}

/** Shift a "YYYY-MM-DD" by whole days. */
export function shiftDateStr(dateStr: string, deltaDays: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const s = new Date(Date.UTC(y, m - 1, d) + deltaDays * DAY_MS);
  return `${s.getUTCFullYear()}-${pad(s.getUTCMonth() + 1)}-${pad(s.getUTCDate())}`;
}

/** True for a well-formed "YYYY-MM-DD". */
export function isValidDateStr(v: unknown): v is string {
  return typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);
}

/** Friendly day label: 今天 / 昨天 / "M月D日 (週X)". */
export function formatDayLabel(
  dateStr: string,
  nowMs: number = Date.now(),
): string {
  const today = taipeiTodayStr(nowMs);
  if (dateStr === today) return "今天";
  if (dateStr === shiftDateStr(today, -1)) return "昨天";
  const [y, m, d] = dateStr.split("-").map(Number);
  const noonTpe = new Date(Date.UTC(y, m - 1, d, 12 - 8, 0, 0));
  return new Intl.DateTimeFormat("zh-TW", {
    timeZone: TPE,
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(noonTpe);
}

/** "MM/DD" in Taipei (weight chart X axis). */
export function formatMMDD(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TPE,
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

/** "M月D日 HH:mm" in Taipei (log rows). */
export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("zh-TW", {
    timeZone: TPE,
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

/** "HH:mm" in Taipei. */
export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("zh-TW", {
    timeZone: TPE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}
