import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

// Rep-opgaver gemmes i jobs-tabellen med service='rep'.
// start_at sættes til 07:00 på dagen (uden for de 3 booking-slots 08-16)
// så de aldrig blokerer availability-tjekket.

const buildStartEnd = (dateKey: string) => {
  return {
    start_at: `${dateKey}T07:00:00.000Z`,
    end_at: `${dateKey}T07:30:00.000Z`
  };
};

export async function POST(request: Request) {
  try {
    const { error: authError } = requireAdmin(request, ["owner", "admin"]);
    if (authError) return authError;

    const body = (await request.json()) as Record<string, unknown>;
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const date = typeof body.date === "string" ? body.date.trim() : "";
    const notes = typeof body.notes === "string" ? body.notes.trim() || null : null;
    const assignedEmployeeId =
      typeof body.assignedEmployeeId === "string" ? body.assignedEmployeeId.trim() || null : null;

    if (!title) {
      return NextResponse.json({ message: "Titel er påkrævet." }, { status: 400 });
    }
    if (!dateRegex.test(date)) {
      return NextResponse.json({ message: "Ugyldig dato. Brug YYYY-MM-DD." }, { status: 400 });
    }

    const { start_at, end_at } = buildStartEnd(date);

    const supabase = createSupabaseServiceClient();

    const { data, error } = await supabase
      .from("jobs")
      .insert({
        title,
        service: "rep",
        status: "scheduled",
        start_at,
        end_at,
        notes,
        assigned_employee_id: assignedEmployeeId || null
      })
      .select("id")
      .single();

    if (error || !data) {
      return NextResponse.json({ message: error?.message || "Kunne ikke oprette rep-opgave." }, { status: 500 });
    }

    return NextResponse.json({ id: data.id }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Uventet fejl." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { error: authError } = requireAdmin(request, ["owner", "admin"]);
    if (authError) return authError;

    const url = new URL(request.url);
    const id = url.searchParams.get("id") || "";
    if (!id) {
      return NextResponse.json({ message: "Mangler id." }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();

    const { data, error } = await supabase
      .from("jobs")
      .delete()
      .eq("id", id)
      .eq("service", "rep")
      .select("id")
      .maybeSingle();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ message: "Rep-opgave ikke fundet." }, { status: 404 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Uventet fejl." }, { status: 500 });
  }
}
