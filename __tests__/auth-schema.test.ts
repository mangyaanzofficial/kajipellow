import { describe, it, expect } from "vitest";
import { registerSchema, loginSchema } from "@/types/auth";

describe("registerSchema", () => {
  it("rejects mismatched password confirmation", () => {
    const result = registerSchema.safeParse({
      name: "Budi Santoso",
      username: "budi123",
      email: "budi@example.com",
      phone: "081234567890",
      password: "Password123",
      confirmPassword: "Password124",
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid registration data", () => {
    const result = registerSchema.safeParse({
      name: "Budi Santoso",
      username: "budi123",
      email: "budi@example.com",
      phone: "081234567890",
      password: "Password123",
      confirmPassword: "Password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects weak password without uppercase/number", () => {
    const result = registerSchema.safeParse({
      name: "Budi Santoso",
      username: "budi123",
      email: "budi@example.com",
      phone: "081234567890",
      password: "password",
      confirmPassword: "password",
    });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("requires identifier and password", () => {
    const result = loginSchema.safeParse({ identifier: "", password: "" });
    expect(result.success).toBe(false);
  });
});
