import type { SupabaseClient } from "@supabase/supabase-js";

export type CustomerMatchInput = {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  postalCode?: string | null;
  address?: string | null;
  city?: string | null;
};

export type CustomerRecord = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  postal_code: string | null;
  address: string | null;
  city: string | null;
};

/**
 * Normaliser telefonnummer til sammenligning.
 * Fjerner mellemrum, parenteser, bindestreger og landekode "+45".
 */
const normalizePhone = (phone: string | null | undefined): string => {
  if (!phone) return "";
  let cleaned = phone.replace(/[\s()-]/g, "");
  // Fjern dansk landekode
  if (cleaned.startsWith("+45")) {
    cleaned = cleaned.slice(3);
  } else if (cleaned.startsWith("0045")) {
    cleaned = cleaned.slice(4);
  }
  return cleaned;
};

const normalizeEmail = (email: string | null | undefined): string => {
  if (!email) return "";
  return email.trim().toLowerCase();
};

/**
 * Find eller opret en kunde baseret på telefon eller email.
 * Returnerer altid et customer_id.
 *
 * Matchlogik:
 * 1. Søg på telefonnummer (primær nøgle)
 * 2. Søg på email (sekundær nøgle)
 * 3. Ingen match → opret ny kunde
 *
 * Ved match: opdaterer felter der er tomme med nye værdier.
 */
export const findOrCreateCustomer = async (
  supabase: SupabaseClient,
  input: CustomerMatchInput
): Promise<{ customerId: string; isNew: boolean; error: string | null }> => {
  const phone = normalizePhone(input.phone);
  const email = normalizeEmail(input.email);
  const name = input.name?.trim() || null;
  const postalCode = input.postalCode?.trim() || null;
  const address = input.address?.trim() || null;
  const city = input.city?.trim() || null;

  // Hvis hverken telefon eller email, kan vi ikke matche
  if (!phone && !email) {
    // Opret en ny kunde uden unikke nøgler
    const { data, error } = await supabase
      .from("customers")
      .insert({
        name,
        postal_code: postalCode,
        address,
        city,
        source: "auto"
      })
      .select("id")
      .single();

    if (error || !data) {
      return { customerId: "", isNew: false, error: error?.message || "Kunne ikke oprette kunde." };
    }

    return { customerId: data.id, isNew: true, error: null };
  }

  // 1. Søg på telefon
  let existing: CustomerRecord | null = null;

  if (phone) {
    const { data } = await supabase
      .from("customers")
      .select("id, name, email, phone, postal_code, address, city")
      .eq("phone", phone)
      .maybeSingle();

    if (data) {
      existing = data as CustomerRecord;
    }
  }

  // 2. Søg på email hvis ingen telefon-match
  if (!existing && email) {
    const { data } = await supabase
      .from("customers")
      .select("id, name, email, phone, postal_code, address, city")
      .eq("email", email)
      .maybeSingle();

    if (data) {
      existing = data as CustomerRecord;
    }
  }

  // 3. Match fundet → opdater tomme felter
  if (existing) {
    const updates: Record<string, string> = {};

    if (!existing.name && name) updates.name = name;
    if (!existing.email && email) updates.email = email;
    if (!existing.phone && phone) updates.phone = phone;
    if (!existing.postal_code && postalCode) updates.postal_code = postalCode;
    if (!existing.address && address) updates.address = address;
    if (!existing.city && city) updates.city = city;

    if (Object.keys(updates).length > 0) {
      await supabase
        .from("customers")
        .update(updates)
        .eq("id", existing.id);
    }

    return { customerId: existing.id, isNew: false, error: null };
  }

  // 4. Ingen match → opret ny kunde
  const { data, error } = await supabase
    .from("customers")
    .insert({
      name,
      email: email || null,
      phone: phone || null,
      postal_code: postalCode,
      address,
      city,
      source: "auto"
    })
    .select("id")
    .single();

  if (error || !data) {
    // Mulig race condition: en anden request oprettede kunden lige nu
    // Prøv at matche igen
    if (phone) {
      const { data: retryData } = await supabase
        .from("customers")
        .select("id")
        .eq("phone", phone)
        .maybeSingle();

      if (retryData) {
        return { customerId: retryData.id, isNew: false, error: null };
      }
    }

    if (email) {
      const { data: retryData } = await supabase
        .from("customers")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (retryData) {
        return { customerId: retryData.id, isNew: false, error: null };
      }
    }

    return { customerId: "", isNew: false, error: error?.message || "Kunne ikke oprette kunde." };
  }

  return { customerId: data.id, isNew: true, error: null };
};
