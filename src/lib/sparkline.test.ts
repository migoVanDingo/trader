import { describe, it, expect } from "vitest";
import { sparklinePath } from "./sparkline";

describe("sparklinePath", () => {
  it("returns empty for fewer than two points", () => {
    expect(sparklinePath([], 100, 20)).toBe("");
    expect(sparklinePath([5], 100, 20)).toBe("");
  });

  it("starts with a move and spans the full width", () => {
    const d = sparklinePath([1, 2, 3], 100, 20);
    expect(d.startsWith("M0")).toBe(true);
    // last point x = width
    expect(d).toContain("L100.00");
  });

  it("puts the max at the top (y=0) and min at the bottom (y=height)", () => {
    // rising series → first point at bottom (y=20), last at top (y=0)
    const d = sparklinePath([1, 2, 3], 100, 20);
    expect(d).toContain("M0.00 20.00");
    expect(d.endsWith("0.00 0.00")).toBe(true);
  });

  it("is flat (y=height) for constant input", () => {
    const d = sparklinePath([5, 5, 5], 100, 20);
    expect(d).toBe("M0.00 20.00 L50.00 20.00 L100.00 20.00");
  });
});
