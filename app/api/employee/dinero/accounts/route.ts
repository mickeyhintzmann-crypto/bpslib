import { NextResponse } from "next/server";
import { getSessionEmployee } from "@/lib/employee-session";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { decryptSecret } from "@/lib/encryption";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { error, employee } = await getSessionEmployee(request);
    if (error || !employee) return error;

    const supabase = createSupabaseServiceClient();
    const { data: conn } = await supabase
      .from("employee_dinero_connections")
      .select("organization_id, api_key_encrypted, is_active")
      .eq("employee_id", employee.id)
      .maybeSingle();

    if (!conn?.is_active) {
      return NextResponse.json({ message: "Dinero ikke forbundet." }, { status: 412 });
    }

    const clientId = process.env.DINERO_CLIENT_ID;
    const clientSecret = process.env.DINERO_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      return NextResponse.json({ message: "Dinero-miljøvariabler mangler." }, { status: 500 });
    }

    const apiKey = decryptSecret(conn.api_key_encrypted);
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const tokenRes = await fetch("https://authz.dinero.dk/dineroapi/oauth/token", {
      method: "POST",
      headers: { Authorization: `Basic ${basicAuth}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ grant_type: "password", scope: "read write", username: apiKey, password: apiKey }).toString(),
      cache: "no-store"
    });

    if (!tokenRes.ok) {
      return NextResponse.json({ message: "Kunne ikke hente Dinero-token." }, { status: 502 });
    }

    const tokenJson = await tokenRes.json() as { access_token?: string };
    const accessToken = tokenJson.access_token;
    if (!accessToken) {
      return NextResponse.json({ message: "Tomt token fra Dinero." }, { status: 502 });
    }

    const base = (process.env.DINERO_API_BASE_URL || "https://api.dinero.dk/v1").replace(/\/+$/, "");
    const accRes = await fetch(`${base}/${encodeURIComponent(conn.organization_id)}/accounts`, {
      headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
      cache: "no-store"
    });

    if (!accRes.ok) {
      return NextResponse.json({ message: `Dinero kontoplan fejl: ${accRes.status}` }, { status: 502 });
    }

    const accData = await accRes.json() as Record<string, unknown>;
    const collection = (accData.Collection || accData.collection || accData.items || accData.data) as unknown;

    if (!Array.isArray(collection)) {
      return NextResponse.json({ accounts: [] }, { status: 200 });
    }

    const accounts: { number: number; name: string }[] = [];
    for (const item of collection) {
      if (!item || typeof item !== "object") continue;
      const entry = item as Record<string, unknown>;
      const num = entry.AccountNumber ?? entry.accountNumber ?? entry.Number ?? entry.number;
      const name = entry.Name ?? entry.name ?? entry.AccountName ?? "";
      if (typeof num === "number") {
        accounts.push({ number: num, name: String(name) });
      }
    }

    accounts.sort((a, b) => a.number - b.number);

    return NextResponse.json({ accounts }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Uventet fejl." }, { status: 500 });
  }
}
