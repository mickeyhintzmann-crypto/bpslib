import { createHash } from "node:crypto";

import { createSupabaseServiceClient } from "@/lib/supabase/server";

type RateLimitInput = {
  request: Request;
  action: string;
  limit: number;
  windowSeconds: number;
};

export type RateLimitResult = {
  allowed: boolean;
  count: number;
  limit: number;
  resetAt: string | null;
  retryAfterSeconds: number;
};

const getClientIp = (request: Request) => {
  const xForwardedFor = request.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    const first = xForwardedFor.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }

  const candidates = ["cf-connecting-ip", "x-real-ip", "x-client-ip"];
  for (const headerName of candidates) {
    const value = request.headers.get(headerName)?.trim();
    if (value) {
      return value;
    }
  }

  return "ukendt-ip";
};

const buildRateLimitKey = (request: Request, action: string) => {
  const ip = getClientIp(request);
  const salt = process.env.RATE_LIMIT_SALT || "lokal-rate-limit-salt";
  const digest = createHash("sha256").update(`${salt}:${action}:${ip}`).digest("hex");
  return `rl:${action}:${digest}`;
};

export const applyRateLimit = async ({
  request,
  action,
  limit,
  windowSeconds
}: RateLimitInput): Promise<RateLimitResult> => {
  const key = buildRateLimitKey(request, action);
  const supabase = createSupabaseServiceClient();

  const { data, error } = await supabase.rpc("rate_limit_hit", {
    p_key: key,
    p_window_seconds: windowSeconds
  });

  if (error) {
    throw new Error(`Rate limit fejl: ${error.message}`);
  }

  const row = Array.isArray(data) ? data[0] : data;
  const count = Number(row?.count ?? 0);
  const resetAt = typeof row?.reset_at === "string" ? row.reset_at : null;

  const allowed = count <= limit;
  let retryAfterSeconds = 0;

  if (!allowed && resetAt) {
    const resetAtTs = new Date(resetAt).getTime();
    if (Number.isFinite(resetAtTs)) {
      retryAfterSeconds = Math.max(1, Math.ceil((resetAtTs - Date.now()) / 1000));
    }
  }

  return {
    allowed,
    count,
    limit,
    resetAt,
    retryAfterSeconds
  };
};
