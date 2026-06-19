import { describe, it, expect } from "vitest";
import { TIMEFRAMES, DEFAULT_TIMEFRAME_ID, getTimeframe } from "./timeframes";

describe("timeframes", () => {
  it("has unique ids", () => {
    const ids = TIMEFRAMES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("includes the default id", () => {
    expect(TIMEFRAMES.some((t) => t.id === DEFAULT_TIMEFRAME_ID)).toBe(true);
  });

  it("resolves a known id", () => {
    expect(getTimeframe("1h").interval).toBe("1h");
  });

  it("falls back to the default for an unknown id", () => {
    expect(getTimeframe("nope").id).toBe(DEFAULT_TIMEFRAME_ID);
  });

  it("every timeframe has a positive limit", () => {
    expect(TIMEFRAMES.every((t) => t.limit > 0)).toBe(true);
  });
});
