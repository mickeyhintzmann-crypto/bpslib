import { NextResponse, type NextRequest } from "next/server";

import { createAndSendDineroInvoice } from "@/lib/dinero";
import { decryptSecret } from "@/lib/encryption";
import { getSessionEmployee, isMissingTable } from "@/lib/employee-session";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const DINERO_MIGRATION = "supabase/migrations/20260305_000100_employee_dinero_invoicing.sql";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type JobRow = {
  id: string;
  title: string;
  service: string | null;
  status: string;
  lead_id: string | null;
  notes: string | null;
  assigned_employee_id: string | null;
  lead: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    location: string | null;
  } | null;
};

type ExistingInvoiceRow = {
  id: string;
  status: string;
  dinero_invoice_id: string | null;
  dinero_invoice_number: string | null;
  sent_at: string | null;
};

type DineroConnectionRow = {
  organization_id: string;
  api_key_encrypted: string;
  is_active: boolean;
};

const asTrimmed = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const asNumber = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const normalized = value.trim().replace(",", ".");
    if (!normalized) {
      return null;
    }
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const resolveId = async (context: RouteContext) => {
  const params = await context.params;
  return params?.id || "";
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { error, employee } = await getSessionEmployee(request);
    if (error || !employee) {
      return error;
    }

    const id = await resolveId(context);
    if (!id || id.startsWith("booking:")) {
      return NextResponse.json({ message: "Ugyldigt job-id." }, { status: 400 });
    }

    const payload = (await request.json()) as Record<string, unknown>;

    const customerName = asTrimmed(payload.customerName);
    const customerEmail = asTrimmed(payload.customerEmail).toLowerCase();
    const customerPhone = asTrimmed(payload.customerPhone) || null;
    const customerAddress = asTrimmed(payload.customerAddress) || null;
    const description = asTrimmed(payload.description);

    const amountExVat = asNumber(payload.amountExVat);
    const vatPercent = asNumber(payload.vatPercent);

    if (customerName.length < 2) {
      return NextResponse.json({ message: "Kundenavn mangler." }, { status: 400 });
    }
    if (!customerEmail || !customerEmail.includes("@")) {
      return NextResponse.json({ message: "Kunde-email mangler eller er ugyldig." }, { status: 400 });
    }
    if (amountExVat === null || amountExVat <= 0) {
      return NextResponse.json({ message: "Pris ex. moms skal være større end 0." }, { status: 400 });
    }
    if (vatPercent === null || vatPercent < 0 || vatPercent > 100) {
      return NextResponse.json({ message: "Moms skal være mellem 0 og 100." }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();

    const { data: jobData, error: jobError } = await supabase
      .from("jobs")
      .select(
        "id, title, service, status, lead_id, notes, assigned_employee_id, lead:lead_id(id,name,email,phone,location)"
      )
      .eq("id", id)
      .eq("assigned_employee_id", employee.id)
      .single();

    if (jobError || !jobData) {
      if (isMissingTable(jobError?.message, "jobs")) {
        return NextResponse.json({ message: "Jobs-tabellen mangler i databasen." }, { status: 503 });
      }
      return NextResponse.json({ message: jobError?.message || "Job ikke fundet." }, { status: 404 });
    }

    const job = jobData as unknown as JobRow;

    if (job.status === "cancelled") {
      return NextResponse.json({ message: "Job er annulleret og kan ikke faktureres." }, { status: 409 });
    }

    const { data: existingInvoice } = await supabase
      .from("job_invoices")
      .select("id, status, dinero_invoice_id, dinero_invoice_number, sent_at")
      .eq("job_id", job.id)
      .maybeSingle();

    const existing = (existingInvoice || null) as ExistingInvoiceRow | null;
    if (existing?.status === "sent") {
      return NextResponse.json(
        {
          ok: true,
          alreadySent: true,
          invoice: {
            invoiceId: existing.dinero_invoice_id,
            invoiceNumber: existing.dinero_invoice_number,
            sentAt: existing.sent_at
          }
        },
        { status: 200 }
      );
    }

    const { data: connectionData, error: connectionError } = await supabase
      .from("employee_dinero_connections")
      .select("organization_id, api_key_encrypted, is_active")
      .eq("employee_id", employee.id)
      .maybeSingle();

    if (connectionError) {
      if (isMissingTable(connectionError.message, "employee_dinero_connections")) {
        return NextResponse.json(
          { message: `Dinero-tabellen mangler. Kør migrationen ${DINERO_MIGRATION}.` },
          { status: 503 }
        );
      }
      return NextResponse.json({ message: connectionError.message }, { status: 500 });
    }

    if (!connectionData || !connectionData.is_active) {
      return NextResponse.json(
        { message: "Dinero er ikke forbundet på din medarbejderprofil endnu." },
        { status: 412 }
      );
    }

    const connection = connectionData as DineroConnectionRow;
    const apiKey = decryptSecret(connection.api_key_encrypted);

    await supabase
      .from("jobs")
      .update({ status: job.status === "invoiced" ? "invoiced" : "done" })
      .eq("id", job.id)
      .eq("assigned_employee_id", employee.id);

    const requestPayload = {
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      description,
      amountExVat,
      vatPercent,
      currency: "DKK"
    };

    try {
      const invoiceResult = await createAndSendDineroInvoice({
        organizationId: connection.organization_id,
        apiKey,
        customer: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
          address: customerAddress
        },
        invoice: {
          customerEmail,
          jobId: job.id,
          description: description || `${job.title} (${job.service || "service"})`,
          amountExVat,
          vatPercent,
          currency: "DKK"
        }
      });

      const invoiceRecord = {
        job_id: job.id,
        employee_id: employee.id,
        source: "dinero",
        status: "sent",
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        customer_address: customerAddress,
        amount_ex_vat: amountExVat,
        vat_percent: vatPercent,
        currency: "DKK",
        description: description || `${job.title} (${job.service || "service"})`,
        dinero_contact_id: invoiceResult.contactId,
        dinero_invoice_id: invoiceResult.invoiceId,
        dinero_invoice_number: invoiceResult.invoiceNumber,
        sent_at: new Date().toISOString(),
        error_message: null,
        request_payload: requestPayload,
        response_payload: invoiceResult.raw
      };

      const { error: invoiceUpsertError } = await supabase.from("job_invoices").upsert(invoiceRecord, {
        onConflict: "job_id"
      });

      if (invoiceUpsertError) {
        if (isMissingTable(invoiceUpsertError.message, "job_invoices")) {
          return NextResponse.json(
            { message: `Invoice-tabellen mangler. Kør migrationen ${DINERO_MIGRATION}.` },
            { status: 503 }
          );
        }
        return NextResponse.json({ message: invoiceUpsertError.message }, { status: 500 });
      }

      await supabase
        .from("employee_dinero_connections")
        .update({ last_verified_at: new Date().toISOString(), last_error: null })
        .eq("employee_id", employee.id);

      await supabase.from("jobs").update({ status: "invoiced" }).eq("id", job.id).eq("assigned_employee_id", employee.id);

      return NextResponse.json(
        {
          ok: true,
          jobId: job.id,
          invoice: {
            invoiceId: invoiceResult.invoiceId,
            invoiceNumber: invoiceResult.invoiceNumber,
            contactId: invoiceResult.contactId
          }
        },
        { status: 200 }
      );
    } catch (invoiceError) {
      const message = invoiceError instanceof Error ? invoiceError.message : "Ukendt fejl ved afsendelse til Dinero.";

      await supabase.from("job_invoices").upsert(
        {
          job_id: job.id,
          employee_id: employee.id,
          source: "dinero",
          status: "failed",
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          customer_address: customerAddress,
          amount_ex_vat: amountExVat,
          vat_percent: vatPercent,
          currency: "DKK",
          description: description || `${job.title} (${job.service || "service"})`,
          error_message: message,
          request_payload: requestPayload
        },
        { onConflict: "job_id" }
      );

      await supabase
        .from("employee_dinero_connections")
        .update({ last_error: message })
        .eq("employee_id", employee.id);

      return NextResponse.json({ message: `Faktura blev ikke sendt: ${message}` }, { status: 502 });
    }
  } catch (routeError) {
    console.error(routeError);
    return NextResponse.json({ message: "Uventet fejl ved afslutning af opgave." }, { status: 500 });
  }
}
