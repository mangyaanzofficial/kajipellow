import { describe, it, expect } from "vitest";
import { formatCurrency } from "@/utils/currency";

describe("formatCurrency", () => {
  it("formats integer rupiah correctly", () => {
    expect(formatCurrency(10000)).toContain("10.000");
  });

  it("handles zero", () => {
    expect(formatCurrency(0)).toContain("0");
  });
});
