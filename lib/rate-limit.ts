import "server-only";

type RateLimitOptions = {
  limit: number;
  windowMs: number;
};

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const globalForRateLimit = globalThis as typeof globalThis & {
  __dailyJournalRateLimit?: Map<string, RateLimitBucket>;
};

const buckets = globalForRateLimit.__dailyJournalRateLimit ?? new Map();
globalForRateLimit.__dailyJournalRateLimit = buckets;

export type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
  remaining: number;
};

export function checkRateLimit(
  key: string,
  options: RateLimitOptions,
): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, {
      count: 1,
      resetAt: now + options.windowMs,
    });

    return {
      allowed: true,
      retryAfterSeconds: Math.ceil(options.windowMs / 1000),
      remaining: options.limit - 1,
    };
  }

  if (bucket.count >= options.limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
      remaining: 0,
    };
  }

  bucket.count += 1;

  return {
    allowed: true,
    retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
    remaining: options.limit - bucket.count,
  };
}
