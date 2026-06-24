import { describe, expect, it } from "vitest";
import { formatMMDD, taipeiDayRange, taipeiNowInput } from "./datetime";

describe("taipeiDayRange", () => {
  it("brackets the Taipei day for an afternoon-UTC instant", () => {
    // 2026-06-25T02:00Z = 2026-06-25 10:00 Taipei → day = 2026-06-25 (TPE)
    const { from, to } = taipeiDayRange(Date.parse("2026-06-25T02:00:00Z"));
    expect(from).toBe("2026-06-24T16:00:00.000Z"); // TPE midnight
    expect(to).toBe("2026-06-25T16:00:00.000Z");
  });

  it("late-UTC instant still maps to the next Taipei day", () => {
    // 2026-06-25T20:00Z = 2026-06-26 04:00 Taipei → day = 2026-06-26
    const { from } = taipeiDayRange(Date.parse("2026-06-25T20:00:00Z"));
    expect(from).toBe("2026-06-25T16:00:00.000Z");
  });
});

describe("taipeiNowInput", () => {
  it("formats Taipei wall time as YYYY-MM-DDTHH:mm", () => {
    expect(taipeiNowInput(Date.parse("2026-06-25T02:05:00Z"))).toBe(
      "2026-06-25T10:05",
    );
  });
});

describe("formatMMDD", () => {
  it("formats MM/DD in Taipei", () => {
    expect(formatMMDD("2026-06-25T02:00:00Z")).toBe("06/25");
  });
});
