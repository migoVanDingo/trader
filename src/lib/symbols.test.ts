import { describe, it, expect } from "vitest";
import { baseAsset, WATCHLIST_SYMBOLS } from "./symbols";

describe("baseAsset", () => {
  it("strips the USDT quote suffix", () => {
    expect(baseAsset("BTCUSDT")).toBe("BTC");
  });

  it("leaves non-USDT symbols unchanged", () => {
    expect(baseAsset("FOO")).toBe("FOO");
  });
});

describe("WATCHLIST_SYMBOLS", () => {
  it("has no duplicates", () => {
    expect(new Set(WATCHLIST_SYMBOLS).size).toBe(WATCHLIST_SYMBOLS.length);
  });
});
