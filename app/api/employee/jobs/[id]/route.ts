import { NextResponse, type NextRequest } from "next/server";

import { getSessionEmployee, isMissingTable } from "@/lib/employee-session";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const JOB_MEDIA_MIGRATION = "supabase/migrations/20260305000110_employee_job_media_uploads.sql";
const JOB_BOOKING_CITY_MIGRATION = "supabase/migrations/20260305000120_booking_job_city_task_description.sql";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type LeadRow = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  message: string | null;
};

type JobRow = {
  id: string;
  title: string;
  service: string | null;
  status: string;
  start_at: string;
  end_at: string;
  city: string | null;
  location: string | null;
  address: string | null;
  notes: string | null;
  task_description: string | null;
  lead_id: string | null;
  lead: LeadRow | LeadRow[] | null;
};

type JobInvoiceRow = {
  job_id: string;
  status: string;
  sent_at: string | null;
};

type AiQuoteRequestRow = {
  id: string;
  images: unknown;
};

type AiQuoteResultRow = {
  output: Record<string, unknown> | null;
  admin_override: Record<string, unknown> | null;
};

type JobMediaRow = {
  id: string;
  created_at: string;
  storage_bucket: string;
  storage_path: string;
  original_filename: string | null;
  mime_type: string | null;
  file_size_bytes: number | null;
  status: string;
  usage_target: string | null;
  review_note: string | null;
};

type DineroConnectionRow = {
  organization_id: string | null;
  is_active: boolean;
};

type StoredImage = {
  path: string;
  name: string;
};

const asSingleRelation = <T>(value: T | T[] | null | undefined): T | null => {
  if (Array.isArray(value)) {
    return value[0] || null;
  }
  return value || null;
};

const resolveId = async (context: RouteContext) => {
  const params = await context.params;
  return decodeURIComponent(params?.id || "");
};

const compactText = (value: string | null | undefined) => (value || "").replace(/\s+/g, " ").trim();

const truncate = (value: string, max: number) => (value.length > max ? `${value.slice(0, max - 1)}…` : value);

const buildDefaultInvoiceDescription = (job: {
  title: string;
  service: string | null;
  city: string | null;
  taskDescription: string | null;
  notes: string | null;
  leadMessage: string | null;
}) => {
  const city = compactText(job.city);
  const taskDescription = compactText(job.taskDescription);
  const notes = compactText(job.notes);
  const leadMessage = compactText(job.leadMessage);
  const detail = taskDescription || notes || leadMessage;

  const parts = [job.title];
  if (city) {
    parts.push(`By: ${city}`);
  }
  if (job.service) {
    parts.push(`Service: ${job.service}`);
  }
  if (detail) {
    parts.push(`Opgave: ${truncate(detail, 280)}`);
  }
  return parts.join(" · ");
};

const parseSampleNumber = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    let normalized = value.trim();
    if (!normalized) {
      return null;
    }
    normalized = normalized.replace(/[^\d.,]/g, "");
    if (!normalized) {
      return null;
    }
    if (normalized.includes(",")) {
      normalized = normalized.replace(/\./g, "").replace(",", ".");
    } else {
      normalized = normalized.replace(/\./g, "");
    }
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const parsePriceRange = (value: unknown) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { min: null as number | null, max: null as number | null };
  }
  const obj = value as Record<string, unknown>;
  const range =
    obj.price_range && typeof obj.price_range === "object" && !Array.isArray(obj.price_range)
      ? (obj.price_range as Record<string, unknown>)
      : {};

  const min = parseSampleNumber(range.min ?? obj.price_min);
  const max = parseSampleNumber(range.max ?? obj.price_max);
  return { min, max };
};

const formatPriceRange = (min: number | null, max: number | null) => {
  if (typeof min === "number" && typeof max === "number") {
    return `${Math.round(min).toLocaleString("da-DK")} - ${Math.round(max).toLocaleString("da-DK")} kr.`;
  }
  if (typeof min === "number") {
    return `Fra ${Math.round(min).toLocaleString("da-DK")} kr.`;
  }
  if (typeof max === "number") {
    return `Op til ${Math.round(max).toLocaleString("da-DK")} kr.`;
  }
  return "Ikke angivet";
};

const buildMapsUrl = (address: string | null, location: string | null) => {
  const query = [address, location].filter(Boolean).join(", ");
  if (!query) {
    return null;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
};

const joinAddressParts = (...parts: Array<string | null | undefined>) => {
  const seen = new Set<string>();
  const values: string[] = [];
  parts.forEach((part) => {
    const normalized = compactText(part);
    if (!normalized) {
      return;
    }
    const key = normalized.toLowerCase();
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    values.push(normalized);
  });
  return values.join(", ");
};

const parseStoredImages = (images: unknown): StoredImage[] => {
  if (!Array.isArray(images)) {
    return [];
  }

  const parsed: StoredImage[] = [];
  images.forEach((entry, index) => {
    if (typeof entry === "string") {
      const path = entry.trim();
      if (path) {
        parsed.push({
          path,
          name: `Billede ${index + 1}`
        });
      }
      return;
    }

    if (entry && typeof entry === "object" && "path" in entry) {
      const item = entry as { path?: unknown; name?: unknown };
      const path = typeof item.path === "string" ? item.path.trim() : "";
      if (!path) {
        return;
      }
      const name = typeof item.name === "string" && item.name.trim() ? item.name.trim() : `Billede ${index + 1}`;
      parsed.push({ path, name });
    }
  });

  return parsed;
};

const isMissingColumn = (message: string | undefined) => {
  const normalized = (message || "").toLowerCase();
  return normalized.includes("column") && normalized.includes("does not exist");
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { error, employee, session } = await getSessionEmployee(request);
    if (error || !employee || !session) {
      return error;
    }

    const id = await resolveId(context);
    if (!id) {
      return NextResponse.json({ message: "Ugyldigt job-id." }, { status: 400 });
    }

    // ─── Booking-sti ──────────────────────────────────────────────────────────
    if (id.startsWith("booking:")) {
      const bookingId = id.slice("booking:".length);
      const supabase = createSupabaseServiceClient();

      const [{ data: bookingData, error: bookingError }, { data: connectionData }] = await Promise.all([
        supabase
          .from("bookings")
          .select("id, service_type, status, date, start_slot_index, slot_count, address, postal_code, city, customer_name, customer_phone, customer_email, notes, task_description, price_total")
          .eq("id", bookingId)
          .eq("assigned_to", session.id)
          .single(),
        supabase
          .from("employee_dinero_connections")
          .select("organization_id, is_active")
          .eq("employee_id", employee.id)
          .maybeSingle()
      ]);

      if (bookingError || !bookingData) {
        return NextResponse.json({ message: "Booking ikke fundet." }, { status: 404 });
      }

      const booking = bookingData as {
        id: string; service_type: string | null; status: string | null;
        date: string | null; start_slot_index: number | null; slot_count: number | null;
        address: string | null; postal_code: string | null; city: string | null;
        customer_name: string | null; customer_phone: string | null; customer_email: string | null;
        notes: string | null; task_description: string | null; price_total: number | null;
      };

      const { data: invoiceRows } = await supabase
        .from("job_invoices")
        .select("job_id, status, sent_at")
        .eq("job_id", `booking:${booking.id}`)
        .limit(1);

      const invoiceRow = ((invoiceRows || [])[0] || null) as { job_id: string; status: string; sent_at: string | null } | null;
      const dineroConnection = (connectionData || null) as DineroConnectionRow | null;
      const priceTotal = typeof booking.price_total === "number" ? booking.price_total : null;
      const amountExVat = priceTotal ? Math.round(priceTotal / 1.25) : null;
      const taskDesc = booking.task_description || booking.notes || null;
      const addressFull = [booking.address, booking.city, booking.postal_code].filter(Boolean).join(", ");

      return NextResponse.json({
        item: {
          id: `booking:${booking.id}`,
          title: booking.service_type || "Booking",
          service: booking.service_type,
          status: booking.status || "confirmed",
          startAt: booking.date ? `${booking.date}T08:00:00` : new Date().toISOString(),
          endAt: booking.date ? `${booking.date}T16:00:00` : new Date().toISOString(),
          city: booking.city,
          location: booking.city || booking.postal_code || null,
          address: booking.address,
          notes: taskDesc,
          taskDescription: taskDesc,
          lead: {
            id: `booking:${booking.id}`,
            name: booking.customer_name,
            email: booking.customer_email,
            phone: booking.customer_phone,
            location: booking.city || null,
            message: taskDesc
          },
          priceMin: priceTotal,
          priceMax: priceTotal,
          priceLabel: priceTotal ? `${Math.round(priceTotal).toLocaleString("da-DK")} kr.` : "Ikke angivet",
          mapsUrl: buildMapsUrl(booking.address, booking.city || null),
          invoiceStatus: invoiceRow?.status || null,
          invoicedAt: invoiceRow?.sent_at || null,
          sourceImages: [],
          uploadedImages: []
        },
        employee: {
          id: employee.id,
          name: employee.name,
          email: employee.email,
          dineroConnected: Boolean(dineroConnection?.is_active && dineroConnection?.organization_id),
          dineroOrganizationId: dineroConnection?.organization_id || null
        },
        invoiceDefaults: {
          customerName: booking.customer_name || "",
          customerEmail: booking.customer_email || "",
          customerPhone: booking.customer_phone || "",
          customerAddress: addressFull,
          description: [booking.service_type, addressFull, taskDesc].filter(Boolean).join(" · "),
          amountExVat,
          vatPercent: 25
        }
      }, { status: 200 });
    }

    const supabase = createSupabaseServiceClient();

    const [{ data: jobData, error: jobError }, { data: connectionData, error: connectionError }] = await Promise.all([
      supabase
        .from("jobs")
        .select("id,title,service,status,start_at,end_at,city,location,address,notes,task_description,lead_id,lead:lead_id(id,name,email,phone,location,message)")
        .eq("id", id)
        .eq("assigned_employee_id", employee.id)
        .single(),
      supabase
        .from("employee_dinero_connections")
        .select("organization_id, is_active")
        .eq("employee_id", employee.id)
        .maybeSingle()
    ]);

    if (jobError || !jobData) {
      if (isMissingTable(jobError?.message, "jobs")) {
        return NextResponse.json({ message: "Jobs-tabellen mangler i databasen." }, { status: 503 });
      }
      if (isMissingColumn(jobError?.message)) {
        return NextResponse.json(
          { message: `Jobs-felter mangler. Kør migrationen ${JOB_BOOKING_CITY_MIGRATION}.` },
          { status: 503 }
        );
      }
      return NextResponse.json({ message: jobError?.message || "Job blev ikke fundet." }, { status: 404 });
    }

    if (connectionError && !isMissingTable(connectionError.message, "employee_dinero_connections")) {
      return NextResponse.json({ message: connectionError.message }, { status: 500 });
    }

    const job = jobData as unknown as JobRow;
    const lead = asSingleRelation(job.lead);

    const [{ data: invoiceRows, error: invoiceError }, { data: aiRequestData, error: aiRequestError }, { data: uploadRows, error: uploadError }] =
      await Promise.all([
        supabase.from("job_invoices").select("job_id, status, sent_at").eq("job_id", job.id).limit(1),
        job.lead_id
          ? supabase
              .from("ai_quote_requests")
              .select("id, images")
              .eq("lead_id", job.lead_id)
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle()
          : Promise.resolve({ data: null, error: null }),
        supabase
          .from("job_media_uploads")
          .select("id, created_at, storage_bucket, storage_path, original_filename, mime_type, file_size_bytes, status, usage_target, review_note")
          .eq("job_id", job.id)
          .order("created_at", { ascending: false })
      ]);

    if (invoiceError && !isMissingTable(invoiceError.message, "job_invoices")) {
      return NextResponse.json({ message: invoiceError.message }, { status: 500 });
    }

    if (aiRequestError && !isMissingTable(aiRequestError.message, "ai_quote_requests")) {
      return NextResponse.json({ message: aiRequestError.message }, { status: 500 });
    }

    if (uploadError) {
      if (isMissingTable(uploadError.message, "job_media_uploads")) {
        return NextResponse.json(
          { message: `Job-medie tabellen mangler. Kør migrationen ${JOB_MEDIA_MIGRATION}.` },
          { status: 503 }
        );
      }
      return NextResponse.json({ message: uploadError.message }, { status: 500 });
    }

    const aiRequest = (aiRequestData || null) as AiQuoteRequestRow | null;
    const aiImages = parseStoredImages(aiRequest?.images || []);

    const [aiSignedResult, mediaSignedResult] = await Promise.all([
      aiImages.length > 0
        ? supabase.storage.from("estimator-images").createSignedUrls(
            aiImages.map((image) => image.path),
            60 * 60
          )
        : Promise.resolve({ data: [] as Array<{ signedUrl?: string | null }>, error: null }),
      Array.isArray(uploadRows) && uploadRows.length > 0
        ? supabase.storage.from("job-media").createSignedUrls(
            (uploadRows as JobMediaRow[]).map((row) => row.storage_path),
            60 * 60
          )
        : Promise.resolve({ data: [] as Array<{ signedUrl?: string | null }>, error: null })
    ]);

    const aiSignedUrls = new Map<string, string | null>();
    aiImages.forEach((image, index) => {
      aiSignedUrls.set(image.path, aiSignedResult.data?.[index]?.signedUrl || null);
    });

    const mediaSignedUrls = new Map<string, string | null>();
    (uploadRows as JobMediaRow[] | null | undefined)?.forEach((row, index) => {
      mediaSignedUrls.set(row.storage_path, mediaSignedResult.data?.[index]?.signedUrl || null);
    });

    let priceMin: number | null = null;
    let priceMax: number | null = null;

    if (aiRequest?.id) {
      const { data: aiResultData, error: aiResultError } = await supabase
        .from("ai_quote_results")
        .select("output, admin_override")
        .eq("request_id", aiRequest.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (aiResultError && !isMissingTable(aiResultError.message, "ai_quote_results")) {
        return NextResponse.json({ message: aiResultError.message }, { status: 500 });
      }

      const aiResult = (aiResultData || null) as AiQuoteResultRow | null;
      const overrideRange = parsePriceRange(aiResult?.admin_override || null);
      const outputRange = parsePriceRange(aiResult?.output || null);
      priceMin = overrideRange.min ?? outputRange.min ?? null;
      priceMax = overrideRange.max ?? outputRange.max ?? null;
    }

    const invoiceRow = ((invoiceRows || [])[0] || null) as JobInvoiceRow | null;
    const dineroConnection = (connectionData || null) as DineroConnectionRow | null;
    const invoiceDescription = buildDefaultInvoiceDescription({
      title: job.title,
      service: job.service,
      city: job.city || job.location || lead?.location || null,
      taskDescription: job.task_description,
      notes: job.notes,
      leadMessage: lead?.message || null
    });

    const defaultAmount = typeof priceMax === "number" ? Math.round(priceMax) : typeof priceMin === "number" ? Math.round(priceMin) : null;

    return NextResponse.json(
      {
        item: {
          id: job.id,
          title: job.title,
          service: job.service,
          status: job.status,
          startAt: job.start_at,
          endAt: job.end_at,
          city: job.city,
          location: job.location,
          address: job.address,
          notes: job.notes,
          taskDescription: job.task_description,
          lead: lead
            ? {
                id: lead.id,
                name: lead.name,
                email: lead.email,
                phone: lead.phone,
                location: lead.location,
                message: lead.message
              }
            : null,
          priceMin,
          priceMax,
          priceLabel: formatPriceRange(priceMin, priceMax),
          mapsUrl: buildMapsUrl(job.address, job.location || lead?.location || null),
          invoiceStatus: invoiceRow?.status || null,
          invoicedAt: invoiceRow?.sent_at || null,
          sourceImages: aiImages.map((image) => ({
            path: image.path,
            name: image.name,
            url: aiSignedUrls.get(image.path) || null
          })),
          uploadedImages: ((uploadRows || []) as JobMediaRow[]).map((row) => ({
            id: row.id,
            createdAt: row.created_at,
            originalFilename: row.original_filename,
            mimeType: row.mime_type,
            fileSizeBytes: row.file_size_bytes,
            status: row.status,
            usageTarget: row.usage_target,
            reviewNote: row.review_note,
            url: mediaSignedUrls.get(row.storage_path) || null
          }))
        },
        employee: {
          id: employee.id,
          name: employee.name,
          email: employee.email,
          dineroConnected: Boolean(dineroConnection?.is_active && dineroConnection?.organization_id),
          dineroOrganizationId: dineroConnection?.organization_id || null
        },
        invoiceDefaults: {
          customerName: lead?.name || "",
          customerEmail: lead?.email || "",
          customerPhone: lead?.phone || "",
          customerAddress: joinAddressParts(job.address, job.city, job.location || lead?.location),
          description: invoiceDescription,
          amountExVat: defaultAmount,
          vatPercent: 25
        }
      },
      { status: 200 }
    );
  } catch (routeError) {
    console.error(routeError);
    return NextResponse.json({ message: "Uventet fejl ved hentning af opgave." }, { status: 500 });
  }
}
