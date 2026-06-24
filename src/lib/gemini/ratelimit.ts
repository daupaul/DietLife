import "server-only";

// Basic per-user throttle to curb abuse of the (paid/quota'd) Gemini calls.
// In-memory + per-instance: a lightweight guardrail, not a distributed limiter.
// Free tier is 10 req/min per project, so we cap each user below that.
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 8;

const hits = new Map<string, number[]>();

export function allowRequest(userId: string): boolean {
  const now = Date.now();
  const recent = (hits.get(userId) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(userId, recent);
    return false;
  }
  recent.push(now);
  hits.set(userId, recent);
  return true;
}
