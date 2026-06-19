import { describe, it, expect } from "vitest";
import {
  formatPrice,
  formatPercent,
  formatCompact,
  formatAmount,
} from "./format";

describe("formatPrice", () => {
  it("uses 2 decimals for large prices with thousands separators", () => {
    expect(formatPrice(1234.5)).toBe("1,234.50");
  });

  it("uses more decimals for sub-cent prices", () => {
    expect(formatPrice(0.001234)).toBe("0.00123400");
  });

  it("renders a dash for non-finite values", () => {
    expect(formatPrice(NaN)).toBe("—");
    expect(formatPrice(Infinity)).toBe("—");
  });
});

describe("formatPercent", () => {
  it("prefixes a + for positive values", () => {
    expect(formatPercent(1.2)).toBe("+1.20%");
  });

  it("keeps the - for negative values", () => {
    expect(formatPercent(-0.5)).toBe("-0.50%");
  });

  it("has no sign for zero", () => {
    expect(formatPercent(0)).toBe("0.00%");
  });
});

describe("formatAmount", () => {
  it("keeps small sizes and trims to 4 decimals", () => {
    expect(formatAmount(0.003)).toBe("0.003");
    expect(formatAmount(1234.56789)).toBe("1,234.5679");
  });

  it("renders a dash for non-finite values", () => {
    expect(formatAmount(NaN)).toBe("—");
  });
});

describe("formatCompact", () => {
  it("compacts large numbers", () => {
    expect(formatCompact(1500)).toBe("1.5K");
    expect(formatCompact(2_300_000)).toBe("2.3M");
  });

  it("renders a dash for non-finite values", () => {
    expect(formatCompact(NaN)).toBe("—");
  });
});
