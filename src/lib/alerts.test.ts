import { describe, it, expect } from "vitest";
import { crossed } from "./alerts";

describe("crossed", () => {
  it("fires 'above' when price reaches or exceeds the target", () => {
    expect(crossed("above", 100, 99.99)).toBe(false);
    expect(crossed("above", 100, 100)).toBe(true);
    expect(crossed("above", 100, 101)).toBe(true);
  });

  it("fires 'below' when price reaches or drops under the target", () => {
    expect(crossed("below", 100, 100.01)).toBe(false);
    expect(crossed("below", 100, 100)).toBe(true);
    expect(crossed("below", 100, 99)).toBe(true);
  });
});
