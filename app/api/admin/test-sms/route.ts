import { NextResponse, type NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { sendSms, hasTwilioConfig } from "@/lib/sms";

export async function POST(request: NextRequest) {
  try {
    const { error: authError } = requireAdmin(request, ["owner", "admin"]);
    if (authError) return authError;

    const { phone } = (await request.json()) as { phone?: string };
    if (!phone) {
      return NextResponse.json({ message: "Mangler telefonnummer." }, { status: 400 });
    }

    const configured = hasTwilioConfig();
    if (!configured) {
      return NextResponse.json({
        message: "Twilio er IKKE konfigureret.",
        env: {
          hasSid: Boolean(process.env.TWILIO_ACCOUNT_SID),
          hasToken: Boolean(process.env.TWILIO_AUTH_TOKEN),
          hasSender: Boolean(process.env.TWILIO_SENDER_NAME),
          senderValue: process.env.TWILIO_SENDER_NAME || "(tom)",
        }
      }, { status: 500 });
    }

    const result = await sendSms({
      to: phone,
      body: "Test SMS fra BP Slib admin panel.",
    });

    return NextResponse.json({
      ok: result.ok,
      error: result.error || null,
      sid: result.sid || null,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Fejl ved test-SMS.", error: String(error) }, { status: 500 });
  }
}
