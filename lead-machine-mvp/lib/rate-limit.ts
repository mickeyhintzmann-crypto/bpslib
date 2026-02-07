const DEFAULT_LIMIT = 10;
const DEFAULT_WINDOW_SECONDS = 15 * 60;

const memoryStore = new Map<
  string,
  { count: number; expiresAt: number }
>();
let warnedFallback = false;

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  resetSeconds: number;
  limit: number;
  source: "upstash" | "memory" | "none";
};

export async function rateLimit(
  key: string,
  limit = DEFAULT_LIMIT,
  windowSeconds = DEFAULT_WINDOW_SECONDS
): Promise<RateLimitResult> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    try {
      const res = await fetch(`${url}/pipeline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          commands: [["INCR", key], ["EXPIRE", key, windowSeconds]]
        })
      });

      if (res.ok) {
        const data = (await res.json()) as Array<{ result: number }>;
        const count = data?.[0]?.result ?? 0;
        const remaining = Math.max(0, limit - count);
        return {
          ok: count <= limit,
          remaining,
          resetSeconds: windowSeconds,
          limit,
          source: "upstash"
        };
      }
    } catch (error) {
      console.warn("rate_limit_upstash_failed", error);
    }
  } else if (!warnedFallback) {
    warnedFallback = true;
    console.warn("rate_limit_memory_fallback");
  }

  const now = Date.now();
  const entry = memoryStore.get(key);
  if (!entry || entry.expiresAt < now) {
    memoryStore.set(key, { count: 1, expiresAt: now + windowSeconds * 1000 });
    return {
      ok: true,
      remaining: limit - 1,
      resetSeconds: windowSeconds,
      limit,
      source: "memory"
    };
  }

  entry.count += 1;
  const remaining = Math.max(0, limit - entry.count);
  return {
    ok: entry.count <= limit,
    remaining,
    resetSeconds: Math.ceil((entry.expiresAt - now) / 1000),
    limit,
    source: "memory"
  };
}
