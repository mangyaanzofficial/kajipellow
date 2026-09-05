import "server-only";

/**
 * Rate limiter in-memory sederhana (fixed window).
 * CATATAN PRODUCTION: instance Next.js di Vercel bisa lebih dari satu (serverless),
 * jadi in-memory map TIDAK reliable lintas instance. Untuk production sebenarnya,
 * ganti implementasi ini dengan Redis/Upstash (Vercel KV) memakai interface yang sama.
 */

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt < now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { success: true, remaining: limit - 1, resetAt };
  }

  if (existing.count >= limit) {
    return { success: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return { success: true, remaining: limit - existing.count, resetAt: existing.resetAt };
}

// Preset yang dipakai di berbagai endpoint sensitif
export const RATE_LIMITS = {
  LOGIN: { limit: 5, windowMs: 5 * 60 * 1000 }, // 5x / 5 menit
  REGISTER: { limit: 3, windowMs: 60 * 60 * 1000 }, // 3x / jam
  ORDER_CREATE: { limit: 20, windowMs: 60 * 1000 }, // 20x / menit
  WEBHOOK: { limit: 60, windowMs: 60 * 1000 },
} as const;
