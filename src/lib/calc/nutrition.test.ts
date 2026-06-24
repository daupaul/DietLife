import { describe, expect, it } from "vitest";
import {
  achievementPct,
  bmr,
  dynamicTdee,
  remainingCalories,
  remainingNutrient,
  sumField,
} from "./nutrition";

describe("bmr (Mifflin-St Jeor)", () => {
  it("computes male BMR (+5)", () => {
    // 10*80 + 6.25*180 - 5*30 + 5 = 800 + 1125 - 150 + 5 = 1780
    expect(bmr({ gender: "male", weightKg: 80, heightCm: 180, age: 30 })).toBe(
      1780,
    );
  });

  it("computes female BMR (-161)", () => {
    // 10*60 + 6.25*165 - 5*25 - 161 = 600 + 1031.25 - 125 - 161 = 1345.25
    expect(
      bmr({ gender: "female", weightKg: 60, heightCm: 165, age: 25 }),
    ).toBeCloseTo(1345.25, 2);
  });
});

describe("dynamicTdee", () => {
  it("= BMR × activity + exercise burn", () => {
    expect(dynamicTdee(1780, 1.5, 300)).toBe(2970);
  });
  it("no exercise → BMR × activity", () => {
    expect(dynamicTdee(1500, 1.2, 0)).toBe(1800);
  });
});

describe("remainingCalories", () => {
  it("refunds exercise into headroom", () => {
    // 2000 + 300 - 1800 = 500
    expect(remainingCalories(2000, 300, 1800)).toBe(500);
  });
  it("clamps to 0 when over budget", () => {
    expect(remainingCalories(2000, 0, 2500)).toBe(0);
  });
  it("exactly at budget → 0", () => {
    expect(remainingCalories(2000, 0, 2000)).toBe(0);
  });
});

describe("achievementPct", () => {
  it("normal progress", () => {
    // 1150 / (2000+300) = 50%
    expect(achievementPct(1150, 2000, 300)).toBeCloseTo(50, 5);
  });
  it("caps at 100", () => {
    expect(achievementPct(5000, 2000, 0)).toBe(100);
  });
  it("divide-by-zero guard → 0", () => {
    expect(achievementPct(1000, 0, 0)).toBe(0);
  });
  it("never negative denom → 0", () => {
    expect(achievementPct(100, -50, 0)).toBe(0);
  });
});

describe("remainingNutrient", () => {
  it("remaining toward goal", () => {
    expect(remainingNutrient(120, 80)).toBe(40);
  });
  it("over goal clamps to 0", () => {
    expect(remainingNutrient(120, 200)).toBe(0);
  });
});

describe("sumField", () => {
  it("sums a numeric field", () => {
    const rows = [{ calories: 100 }, { calories: 250 }, { calories: 50 }];
    expect(sumField(rows, "calories")).toBe(400);
  });
  it("empty → 0", () => {
    expect(sumField([], "calories" as never)).toBe(0);
  });
});
