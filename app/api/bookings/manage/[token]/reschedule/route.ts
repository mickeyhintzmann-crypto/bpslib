import { NextResponse } from "next/server";

import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { sendMail } from "@/lib/mailer";

type RouteContext = {
  params: Promise<{ token: string }> | { token: string };
};

type Payload = {
  message?: unknown;
};

const isMissingRelation = (message: string | undefined, relationName: string) => {
  const normalized = (message || "").toLowerCase();
  return (
    normalized.includes(`relation \"${relationName}\" does not exist`) ||
    normalized.includes(`could not find the table 'public.${relationName}'`)
  );
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const params = await Promise.resolve(context.params);
    const token = params.token?.trim();

    if (!token || token.length < 20) {
      return NextResponse.json({ message: "Linket er ugyldigt." }, { status: 404 });
    }

    const payload = (await request.json()) as Payload;
    const message = typeof payload.message === "string" ? payload.message.trim() : "";

    if (!message || message.length < 5) {
      return NextResponse.json({ message: "Skriv venligst en kort besked." }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();
    const { data: booking, error } = await supabase
      .from("bookings")
      .select("id, customer_name, customer_phone, postal_code")
      .eq("manage_token", token)
      .single();

    if (error || !booking) {
      if (isMissingRelation(error?.message, "bookings")) {
        return NextResponse.json({ message: "Tabellen bookings mangler i databasen." }, { status: 503 });
      }
      return NextResponse.json({ message: "Linket er ugyldigt." }, { status: 404 });
    }

    const note = `Ombooking for booking ${booking.id}. Besked: ${message}`;

    const { error: leadError } = await supabase.from("leads").insert({
      source: "ombooking",
      service: "bordplade",
      name: booking.customer_name || "Ukendt",
      phone: booking.customer_phone || "Ukendt",
      postal_code: booking.postal_code || null,
      message: note,
      status: "new"
    });

    if (leadError) {
      if (isMissingRelation(leadError.message, "leads")) {
        return NextResponse.json({ message: "Tabellen leads mangler i databasen." }, { status: 503 });
      }
      return NextResponse.json({ message: leadError.message || "Kunne ikke gemme ombooking." }, { status: 500 });
    }

    // Send email notification to admin so the request isn't missed
    const notifyEmails = (process.env.LEAD_NOTIFY_EMAIL || "")
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);

    if (notifyEmails.length > 0) {
      const subject = `Ombooking anmodning – ${booking.customer_name || "Ukendt kunde"}`;
      const body = [
        `Kunde: ${booking.customer_name || "Ukendt"}`,
        `Telefon: ${booking.customer_phone || "Ikke opgivet"}`,
        `Booking ID: ${booking.id}`,
        ``,
        `Kundens besked:`,
        message,
        ``,
        `Ring til kunden og aftale en ny tid.`
      ].join("\n");

      await Promise.allSettled(
        notifyEmails.map((to) => sendMail({ to, subject, text: body }))
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved ombooking." }, { status: 500 });
  }
}
