import { describe, it, expect } from "vitest";
import { rateLimit } from "@/lib/rate-limit";

describe("rateLimit", () => {
  it("allows requests under the limit", () => {
    const key = `test-${Date.now()}-1`;
    const result = rateLimit(key, 3, 60_000);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it("blocks requests over the limit", () => {
    const key = `test-${Date.now()}-2`;
    rateLimit(key, 2, 60_000);
    rateLimit(key, 2, 60_000);
    const third = rateLimit(key, 2, 60_000);
    expect(third.success).toBe(false);
  });
});
