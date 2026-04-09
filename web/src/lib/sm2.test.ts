import { describe, expect, it } from "vitest";
import { initialSrsState, scheduleAfterReview } from "./sm2";

describe("scheduleAfterReview", () => {
  it("lapses without changing easiness", () => {
    const s0 = initialSrsState();
    const { state, daysUntilNext } = scheduleAfterReview(s0, 1);
    expect(state.easiness).toBe(2.5);
    expect(state.repetitions).toBe(0);
    expect(daysUntilNext).toBe(1);
  });

  it("first success uses 1 day interval", () => {
    const s0 = initialSrsState();
    const { state, daysUntilNext } = scheduleAfterReview(s0, 4);
    expect(state.repetitions).toBe(1);
    expect(state.intervalDays).toBe(1);
    expect(daysUntilNext).toBe(1);
  });

  it("second success uses 6 days", () => {
    const afterFirst = scheduleAfterReview(initialSrsState(), 4).state;
    const { state, daysUntilNext } = scheduleAfterReview(afterFirst, 4);
    expect(state.repetitions).toBe(2);
    expect(state.intervalDays).toBe(6);
    expect(daysUntilNext).toBe(6);
  });

  it("clamps easiness at minimum 1.3", () => {
    let s = initialSrsState();
    for (let i = 0; i < 30; i++) {
      s = scheduleAfterReview(s, 3).state;
    }
    expect(s.easiness).toBeGreaterThanOrEqual(1.3);
  });
});
