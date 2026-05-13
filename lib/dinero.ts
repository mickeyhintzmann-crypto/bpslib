type DineroRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  organizationId: string;
  accessToken: string;
  body?: Record<string, unknown> | null;
};

// ─── OAuth2 token cache ───────────────────────────────────────────────────────
type CachedToken = { token: string; expiresAt: number };
const tokenCache = new Map<string, CachedToken>();

const getAccessToken = async (apiKey: string): Promise<string> => {
  const clientId = process.env.DINERO_CLIENT_ID;
  const clientSecret = process.env.DINERO_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "DINERO_CLIENT_ID og DINERO_CLIENT_SECRET mangler i miljøvariable. " +
      "Tilføj dem i Vercel → Settings → Environment Variables."
    );
  }

  const cacheKey = `${clientId}:${apiKey}`;
  const cached = tokenCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now() + 60_000) {
    return cached.token;
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const oauthAbort = new AbortController();
  const oauthTimer = setTimeout(() => oauthAbort.abort(), 20_000);
  let res: Response;
  try {
    res = await fetch("https://authz.dinero.dk/dineroapi/oauth/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "password",
        scope: "read write",
        username: apiKey,
        password: apiKey,
      }).toString(),
      cache: "no-store",
      signal: oauthAbort.signal,
    });
  } finally {
    clearTimeout(oauthTimer);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(
      `Dinero OAuth fejl (${res.status}): ${text.slice(0, 300)}. ` +
      "Tjek at din API-nøgle og Client ID/Secret er korrekte."
    );
  }

  const json = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!json.access_token) {
    throw new Error("Dinero OAuth svarede uden access_token.");
  }

  const expiresIn = typeof json.expires_in === "number" ? json.expires_in : 3600;
  tokenCache.set(cacheKey, {
    token: json.access_token,
    expiresAt: Date.now() + expiresIn * 1000,
  });

  return json.access_token;
};

type DineroContactInput = {
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
};

// "mobilepay" og "paid" → faktura bogføres + betaling registreres
// "net0" → betalingsbetingelse 0 dage, ingen forudbetaling registreres
export type DineroPaymentMethod = "mobilepay" | "paid" | "net0";

type DineroInvoiceInput = {
  contactId: string;
  customerEmail: string;
  jobId: string;
  description: string;
  amountExVat: number;
  vatPercent: number;
  currency: string;
  paymentMethod?: DineroPaymentMethod;
  salesAccountNumber?: number | null;
};

export type DineroInvoiceResult = {
  contactId: string;
  invoiceId: string;
  invoiceNumber: string | null;
  raw: Record<string, unknown>;
};

const DINERO_BASE_URL = (process.env.DINERO_API_BASE_URL || "https://api.dinero.dk/v1").replace(/\/+$/, "");

const isDryRun = () => (process.env.DINERO_DRY_RUN || "").toLowerCase() === "true";

const asRecord = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
};

const firstString = (obj: Record<string, unknown> | null, keys: string[]) => {
  if (!obj) {
    return null;
  }
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return null;
};

const parseJsonSafe = (raw: string) => {
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
};

const dineroRequest = async ({ method = "GET", path, organizationId, accessToken, body }: DineroRequestOptions) => {
  const url = `${DINERO_BASE_URL}/${encodeURIComponent(organizationId)}${path.startsWith("/") ? path : `/${path}`}`;
  const reqAbort = new AbortController();
  const reqTimer = setTimeout(() => reqAbort.abort(), 20_000);
  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
      signal: reqAbort.signal
    });
  } finally {
    clearTimeout(reqTimer);
  }

  const text = await response.text();
  const parsed = parseJsonSafe(text);

  if (!response.ok) {
    const detail = typeof text === "string" && text.trim() ? text.slice(0, 400) : response.statusText;
    throw new Error(`Dinero API fejl (${response.status}): ${detail}`);
  }

  return asRecord(parsed) || { raw: text };
};

const extractContactId = (value: Record<string, unknown> | null) =>
  firstString(value, ["guid", "Guid", "id", "Id", "contactId", "contactGuid", "ContactGuid", "ContactId"]);

const extractInvoiceId = (value: Record<string, unknown> | null) =>
  firstString(value, ["guid", "Guid", "id", "Id", "invoiceId", "invoiceGuid", "InvoiceGuid", "InvoiceId"]);

const extractInvoiceNumber = (value: Record<string, unknown> | null) =>
  firstString(value, ["invoiceNumber", "number", "invoiceNo", "InvoiceNumber", "Number"]);

// Resolve the collection array from a Dinero list response regardless of casing
const extractCollection = (response: Record<string, unknown>): unknown[] | null => {
  const candidate =
    response.Collection ??
    response.collection ??
    response.Contacts ??
    response.contacts ??
    response.Items ??
    response.items ??
    response.Data ??
    response.data;
  return Array.isArray(candidate) ? candidate : null;
};

const findContactByEmail = async (organizationId: string, accessToken: string, email: string) => {
  const searchPaths = [
    `/contacts?query=${encodeURIComponent(email)}`,
    `/contacts?searchString=${encodeURIComponent(email)}`,
    `/contacts`
  ];

  for (const path of searchPaths) {
    try {
      const response = await dineroRequest({ organizationId, accessToken, path });
      const listRaw = extractCollection(response);
      if (!listRaw) {
        continue;
      }

      for (const item of listRaw) {
        const entry = asRecord(item);
        if (!entry) {
          continue;
        }
        const contactId = extractContactId(entry);
        if (!contactId) {
          continue;
        }
        const candidateEmail = firstString(entry, ["email", "Email", "mail", "Mail"]);
        if (candidateEmail && candidateEmail.toLowerCase() === email.toLowerCase()) {
          return contactId;
        }
      }
    } catch {
      // ignore and try next query format
    }
  }

  return null;
};

// Build a contact payload omitting null/empty optional fields so Dinero doesn't
// reject the request with a validation error on those fields.
const buildContactPayload = (input: DineroContactInput, pascal: boolean) => {
  const payload: Record<string, unknown> = pascal
    ? { Name: input.name, Email: input.email, CountryKey: "DK" }
    : { name: input.name, email: input.email, countryKey: "DK" };

  if (input.phone) {
    if (pascal) payload["Phone"] = input.phone;
    else payload["phone"] = input.phone;
  }
  if (input.address) {
    if (pascal) payload["Address"] = input.address;
    else payload["address"] = input.address;
  }

  return payload;
};

const createContact = async ({ organizationId, accessToken, input }: { organizationId: string; accessToken: string; input: DineroContactInput }) => {
  // Dinero requires PascalCase — try it first, fall back to camelCase
  try {
    const response = await dineroRequest({
      method: "POST",
      path: "/contacts",
      organizationId,
      accessToken,
      body: buildContactPayload(input, true)
    });
    const contactId = extractContactId(response);
    if (contactId) {
      return contactId;
    }
  } catch {
    // retry with alternative payload shape
  }

  const fallback = await dineroRequest({
    method: "POST",
    path: "/contacts",
    organizationId,
    accessToken,
    body: buildContactPayload(input, false)
  });

  const contactId = extractContactId(fallback);
  if (!contactId) {
    throw new Error("Dinero kontakt-id mangler i svar.");
  }

  return contactId;
};

const ensureContact = async (organizationId: string, accessToken: string, input: DineroContactInput) => {
  const existing = await findContactByEmail(organizationId, accessToken, input.email);
  if (existing) {
    return existing;
  }
  return createContact({ organizationId, accessToken, input });
};

// Strip any internal prefix (e.g. "booking:") from a job ID so Dinero's
// ExternalReference field only receives a clean alphanumeric/dash value.
const cleanExternalReference = (jobId: string): string => {
  // Remove known prefixes
  const cleaned = jobId.replace(/^booking:/i, "").replace(/^job:/i, "").trim();
  // Truncate to 40 chars (safe upper bound for most reference fields)
  return cleaned.slice(0, 40);
};

const createInvoice = async ({
  organizationId,
  accessToken,
  input
}: {
  organizationId: string;
  accessToken: string;
  input: DineroInvoiceInput;
}) => {
  const today = new Date().toISOString().slice(0, 10);
  const paymentDays = input.paymentMethod === "net0" ? 0 : 8;
  const externalRef = cleanExternalReference(input.jobId);
  const accountNumber = input.salesAccountNumber ?? 1000;

  // Dinero requires a specific Unit enum on each ProductLine.
  // The valid values are not documented publicly. We try all known plausible values
  // in order — a 400 Unit-validation error does NOT create a draft invoice, so this
  // is safe to brute-force. The first successful response wins.
  const UNIT_CANDIDATES = [
    // Previously tried and confirmed invalid: "stk", "time", "timer", "hours", "Stk"
    "dag",    // Danish: dag = day
    "Dag",
    "uge",    // Danish: uge = week
    "Uge",
    "md",     // Danish: måneder (month abbreviation)
    "Md",
    "m",      // meter
    "M",
    "m2",     // square meter
    "M2",
    "km",     // kilometer
    "Km",
    "kg",     // kilogram
    "Kg",
    "l",      // liter
    "L",
    "kasse",  // box
    "sæt",    // set
    "service",
    "none",
    "None",
    "piece",
    "Piece",
    "pcs",
    "each",
    "Each",
    "hour",
    "Hour",
    "day",
    "Day",
  ];

  const baseLine = {
    Description: input.description,
    Quantity: 1,
    BaseAmountValue: input.amountExVat,
    VatRate: input.vatPercent,
    AccountNumber: accountNumber
  };

  const baseHeader = {
    ContactGuid: input.contactId,
    Date: today,
    Currency: input.currency,
    ExternalReference: externalRef,
    PaymentConditionType: "Netto",
    PaymentConditionNumberOfDays: paymentDays
  };

  for (const unit of UNIT_CANDIDATES) {
    const payload = {
      ...baseHeader,
      ProductLines: [{ ...baseLine, Unit: unit }]
    };

    try {
      const result = await dineroRequest({ method: "POST", path: "/invoices", organizationId, accessToken, body: payload });
      console.log(`[dinero] createInvoice succeeded with Unit="${unit}"`);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("ProductLine.Unit") || msg.includes("unit type") || msg.includes("Invalid unit")) {
        // Unit value rejected — try next candidate
        continue;
      }
      // A different error — stop immediately
      throw err;
    }
  }

  // Also try camelCase as a last resort
  const camelPayload = {
    contactGuid: input.contactId,
    date: today,
    currency: input.currency,
    externalReference: externalRef,
    paymentConditionType: "Netto",
    paymentConditionNumberOfDays: paymentDays,
    productLines: [
      {
        description: input.description,
        quantity: 1,
        unit: "dag",
        baseAmountValue: input.amountExVat,
        vatRate: input.vatPercent,
        accountNumber: accountNumber
      }
    ]
  };

  try {
    return await dineroRequest({ method: "POST", path: "/invoices", organizationId, accessToken, body: camelPayload });
  } catch {
    // ignored
  }

  throw new Error(
    `Dinero afviser alle kendte Unit-værdier (dag/uge/md/m/m2/km/kg/l/piece/each/hour/day/...). ` +
    `Kontakt Dinero support på api@dinero.dk og spørg efter gyldige værdier for 'ProductLine.Unit'.`
  );
};

const bookInvoice = async (
  organizationId: string,
  accessToken: string,
  invoiceId: string,
  // Dinero requires the Timestamp from the original create/get response (optimistic concurrency)
  dineroTimestamp?: string
) => {
  try {
    // Python SDK sends { timestamp } (camelCase) from the create response.
    // Try both casings for safety.
    const bodyTs = dineroTimestamp ?? new Date().toISOString();
    await dineroRequest({
      method: "POST",
      path: `/invoices/${encodeURIComponent(invoiceId)}/book`,
      organizationId,
      accessToken,
      body: { timestamp: bodyTs, Timestamp: bodyTs }
    });
  } catch (err) {
    // Some Dinero setups auto-book on create; log but don't throw
    console.warn("[dinero] bookInvoice failed (may be already booked):", err);
  }
};

const registerPayment = async (
  organizationId: string,
  accessToken: string,
  invoiceId: string,
  amountInclVat: number,
  paymentMethod: "mobilepay" | "paid"
) => {
  const today = new Date().toISOString().slice(0, 10);
  const description = paymentMethod === "mobilepay" ? "Betalt med MobilePay" : "Betalt";

  const camelBody = { amount: amountInclVat, description, date: today };
  const pascalBody = { Amount: amountInclVat, Description: description, Date: today };

  try {
    await dineroRequest({
      method: "POST",
      path: `/invoices/${encodeURIComponent(invoiceId)}/payments`,
      organizationId,
      accessToken,
      body: camelBody
    });
  } catch {
    await dineroRequest({
      method: "POST",
      path: `/invoices/${encodeURIComponent(invoiceId)}/payments`,
      organizationId,
      accessToken,
      body: pascalBody
    });
  }
};

const sendInvoice = async (
  organizationId: string,
  accessToken: string,
  invoiceId: string,
  customerEmail: string
) => {
  const camelBody = { recipientEmail: customerEmail };
  const pascalBody = { RecipientEmail: customerEmail };

  let lastError: unknown;

  // Dinero's send endpoint is /email (confirmed in their Postman collection)
  for (const path of [
    `/invoices/${encodeURIComponent(invoiceId)}/email`,
    `/invoices/${encodeURIComponent(invoiceId)}/send`
  ]) {
    for (const body of [camelBody, pascalBody]) {
      try {
        await dineroRequest({ method: "POST", path, organizationId, accessToken, body });
        return; // success
      } catch (err) {
        lastError = err;
      }
    }
  }

  throw new Error(
    `Faktura oprettet i Dinero (id: ${invoiceId}), men afsendelse til ${customerEmail} mislykkedes: ${lastError instanceof Error ? lastError.message : String(lastError)}`
  );
};

export const verifyDineroCredentials = async (organizationId: string, apiKey: string) => {
  if (isDryRun()) {
    return { ok: true };
  }

  // Validate OAuth exchange works — will throw with a clear message if credentials are wrong
  const accessToken = await getAccessToken(apiKey);

  await dineroRequest({
    path: "/contacts?top=1",
    organizationId,
    accessToken
  });

  return { ok: true };
};

export const createAndSendDineroInvoice = async ({
  organizationId,
  apiKey,
  customer,
  invoice
}: {
  organizationId: string;
  apiKey: string;
  customer: DineroContactInput;
  invoice: Omit<DineroInvoiceInput, "contactId"> & { paymentMethod?: DineroPaymentMethod; salesAccountNumber?: number | null };
}): Promise<DineroInvoiceResult> => {
  if (isDryRun()) {
    return {
      contactId: "dryrun-contact",
      invoiceId: `dryrun-invoice-${Date.now()}`,
      invoiceNumber: `${Math.floor(Math.random() * 90000) + 10000}`,
      raw: { mode: "dry-run" }
    };
  }

  // Exchange API key for OAuth access token once — reused across all calls below
  const accessToken = await getAccessToken(apiKey);

  const contactId = await ensureContact(organizationId, accessToken, customer);
  const created = await createInvoice({
    organizationId,
    accessToken,
    input: {
      contactId,
      customerEmail: invoice.customerEmail,
      jobId: invoice.jobId,
      description: invoice.description,
      amountExVat: invoice.amountExVat,
      vatPercent: invoice.vatPercent,
      currency: invoice.currency,
      paymentMethod: invoice.paymentMethod,
      salesAccountNumber: invoice.salesAccountNumber ?? null
    }
  });

  const invoiceId = extractInvoiceId(created);
  if (!invoiceId) {
    throw new Error("Dinero invoice-id mangler i svar.");
  }

  // Pass Dinero's own Timestamp back for optimistic concurrency on book endpoint
  const dineroTimestamp = firstString(created, ["Timestamp", "timestamp"]) ?? undefined;
  await bookInvoice(organizationId, accessToken, invoiceId, dineroTimestamp);

  // Registrer betaling hvis kunden allerede har betalt på stedet
  if (invoice.paymentMethod === "mobilepay" || invoice.paymentMethod === "paid") {
    const amountInclVat = Math.round(invoice.amountExVat * (1 + invoice.vatPercent / 100));
    try {
      await registerPayment(organizationId, accessToken, invoiceId, amountInclVat, invoice.paymentMethod);
    } catch (paymentErr) {
      console.error("[dinero] registerPayment failed (non-fatal):", paymentErr);
    }
  }

  await sendInvoice(organizationId, accessToken, invoiceId, invoice.customerEmail);

  return {
    contactId,
    invoiceId,
    invoiceNumber: extractInvoiceNumber(created),
    raw: created
  };
};
