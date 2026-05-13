type DineroRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  organizationId: string;
  apiKey: string;
  body?: Record<string, unknown> | null;
};

type DineroContactInput = {
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
};

type DineroInvoiceInput = {
  contactId: string;
  customerEmail: string;
  jobId: string;
  description: string;
  amountExVat: number;
  vatPercent: number;
  currency: string;
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

const dineroRequest = async ({ method = "GET", path, organizationId, apiKey, body }: DineroRequestOptions) => {
  const url = `${DINERO_BASE_URL}/${encodeURIComponent(organizationId)}${path.startsWith("/") ? path : `/${path}`}`;
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store"
  });

  const text = await response.text();
  const parsed = parseJsonSafe(text);

  if (!response.ok) {
    const detail = typeof text === "string" && text.trim() ? text.slice(0, 400) : response.statusText;
    throw new Error(`Dinero API fejl (${response.status}): ${detail}`);
  }

  return asRecord(parsed) || { raw: text };
};

const extractContactId = (value: Record<string, unknown> | null) =>
  firstString(value, ["guid", "id", "contactId", "contactGuid", "ContactGuid", "ContactId"]);

const extractInvoiceId = (value: Record<string, unknown> | null) =>
  firstString(value, ["guid", "id", "invoiceId", "invoiceGuid", "InvoiceGuid", "InvoiceId"]);

const extractInvoiceNumber = (value: Record<string, unknown> | null) =>
  firstString(value, ["invoiceNumber", "number", "invoiceNo", "InvoiceNumber", "Number"]);

const findContactByEmail = async (organizationId: string, apiKey: string, email: string) => {
  const searchPaths = [
    `/contacts?query=${encodeURIComponent(email)}`,
    `/contacts?searchString=${encodeURIComponent(email)}`,
    `/contacts`
  ];

  for (const path of searchPaths) {
    try {
      const response = await dineroRequest({ organizationId, apiKey, path });
      const listRaw = (response.contacts || response.items || response.collection || response.data) as unknown;
      if (!Array.isArray(listRaw)) {
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
        const candidateEmail = firstString(entry, ["email", "Email", "mail"]);
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

const createContact = async ({ organizationId, apiKey, input }: { organizationId: string; apiKey: string; input: DineroContactInput }) => {
  const camelPayload = {
    name: input.name,
    email: input.email,
    phone: input.phone,
    address: input.address
  };

  const pascalPayload = {
    Name: input.name,
    Email: input.email,
    Phone: input.phone,
    Address: input.address
  };

  try {
    const response = await dineroRequest({
      method: "POST",
      path: "/contacts",
      organizationId,
      apiKey,
      body: camelPayload
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
    apiKey,
    body: pascalPayload
  });

  const contactId = extractContactId(fallback);
  if (!contactId) {
    throw new Error("Dinero kontakt-id mangler i svar.");
  }

  return contactId;
};

const ensureContact = async (organizationId: string, apiKey: string, input: DineroContactInput) => {
  const existing = await findContactByEmail(organizationId, apiKey, input.email);
  if (existing) {
    return existing;
  }
  return createContact({ organizationId, apiKey, input });
};

const createInvoice = async ({
  organizationId,
  apiKey,
  input
}: {
  organizationId: string;
  apiKey: string;
  input: DineroInvoiceInput;
}) => {
  const today = new Date().toISOString().slice(0, 10);

  const camelPayload = {
    contactGuid: input.contactId,
    date: today,
    currency: input.currency,
    externalReference: input.jobId,
    lines: [
      {
        description: input.description,
        quantity: 1,
        unit: "stk",
        amount: input.amountExVat,
        vat: input.vatPercent
      }
    ]
  };

  const pascalPayload = {
    ContactGuid: input.contactId,
    Date: today,
    Currency: input.currency,
    ExternalReference: input.jobId,
    Lines: [
      {
        Description: input.description,
        Quantity: 1,
        Unit: "stk",
        Amount: input.amountExVat,
        Vat: input.vatPercent
      }
    ]
  };

  try {
    return await dineroRequest({
      method: "POST",
      path: "/invoices",
      organizationId,
      apiKey,
      body: camelPayload
    });
  } catch {
    return await dineroRequest({
      method: "POST",
      path: "/invoices",
      organizationId,
      apiKey,
      body: pascalPayload
    });
  }
};

const bookInvoice = async (organizationId: string, apiKey: string, invoiceId: string) => {
  try {
    await dineroRequest({
      method: "POST",
      path: `/invoices/${encodeURIComponent(invoiceId)}/book`,
      organizationId,
      apiKey,
      body: {}
    });
  } catch {
    // some Dinero setups auto-book on create; ignore this failure
  }
};

const sendInvoice = async (
  organizationId: string,
  apiKey: string,
  invoiceId: string,
  customerEmail: string
) => {
  const camelBody = {
    recipientEmail: customerEmail
  };
  const pascalBody = {
    RecipientEmail: customerEmail
  };

  try {
    await dineroRequest({
      method: "POST",
      path: `/invoices/${encodeURIComponent(invoiceId)}/send`,
      organizationId,
      apiKey,
      body: camelBody
    });
  } catch {
    await dineroRequest({
      method: "POST",
      path: `/invoices/${encodeURIComponent(invoiceId)}/send`,
      organizationId,
      apiKey,
      body: pascalBody
    });
  }
};

export const verifyDineroCredentials = async (organizationId: string, apiKey: string) => {
  if (isDryRun()) {
    return { ok: true };
  }

  await dineroRequest({
    path: "/contacts?top=1",
    organizationId,
    apiKey
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
  invoice: Omit<DineroInvoiceInput, "contactId">;
}): Promise<DineroInvoiceResult> => {
  if (isDryRun()) {
    return {
      contactId: "dryrun-contact",
      invoiceId: `dryrun-invoice-${Date.now()}`,
      invoiceNumber: `${Math.floor(Math.random() * 90000) + 10000}`,
      raw: { mode: "dry-run" }
    };
  }

  const contactId = await ensureContact(organizationId, apiKey, customer);
  const created = await createInvoice({
    organizationId,
    apiKey,
    input: {
      contactId,
      customerEmail: invoice.customerEmail,
      jobId: invoice.jobId,
      description: invoice.description,
      amountExVat: invoice.amountExVat,
      vatPercent: invoice.vatPercent,
      currency: invoice.currency
    }
  });

  const invoiceId = extractInvoiceId(created);
  if (!invoiceId) {
    throw new Error("Dinero invoice-id mangler i svar.");
  }

  await bookInvoice(organizationId, apiKey, invoiceId);
  await sendInvoice(organizationId, apiKey, invoiceId, invoice.customerEmail);

  return {
    contactId,
    invoiceId,
    invoiceNumber: extractInvoiceNumber(created),
    raw: created
  };
};
