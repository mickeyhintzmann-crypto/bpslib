import { createSupabaseServiceClient } from "@/lib/supabase/server";

type EntityType = "booking" | "lead" | "estimator" | "day_override" | "setting" | "case";

type AuditParams = {
  action: string;
  entityType: EntityType;
  entityId: string;
  meta?: Record<string, unknown> | null;
  req: Request;
  actor?: string;
};

const getIp = (req: Request) => {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }
  return req.headers.get("x-real-ip") || req.headers.get("cf-connecting-ip") || null;
};

export const auditLog = async ({ action, entityType, entityId, meta, req, actor }: AuditParams) => {
  try {
    const supabase = createSupabaseServiceClient();
    const ip = getIp(req);
    const userAgent = req.headers.get("user-agent");

    await supabase.from("audit_log").insert({
      actor: actor || "admin",
      action,
      entity_type: entityType,
      entity_id: entityId,
      meta: meta ?? null,
      ip,
      user_agent: userAgent || null
    });
  } catch (error) {
    console.error("[audit] Kunne ikke gemme audit log:", error);
  }
};
