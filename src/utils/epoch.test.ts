import { describe, expect, it } from "vitest";
import { calculateEpochCountdown } from "./epoch";

describe("calculateEpochCountdown", () => {
  const initialTick = 100_000;

  it("starts at Wednesday 12:00 UTC with seven days remaining", () => {
    const countdown = calculateEpochCountdown(
      200,
      initialTick,
      new Date("2026-07-29T12:00:00Z")
    );

    expect(countdown.days).toBe(7);
    expect(countdown.hours).toBe(0);
    expect(countdown.progress).toBe(0);
    expect(countdown.epochStartTick).toBe(initialTick);
  });

  it("reaches halfway on Sunday at midnight UTC", () => {
    const countdown = calculateEpochCountdown(
      200,
      initialTick,
      new Date("2026-08-02T00:00:00Z")
    );

    expect(countdown.days).toBe(3);
    expect(countdown.hours).toBe(12);
    expect(countdown.progress).toBe(50);
  });

  it("uses the previous Wednesday before the noon boundary", () => {
    const countdown = calculateEpochCountdown(
      200,
      initialTick,
      new Date("2026-07-29T11:00:00Z")
    );

    expect(countdown.days).toBe(0);
    expect(countdown.hours).toBe(1);
    expect(countdown.progress).toBeCloseTo(99.4, 1);
  });
});
