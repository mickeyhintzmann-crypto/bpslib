"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/tracking";

const SERVICE_OPTIONS = [
  { value: "gulv", label: "Gulvafslibning" },
  { value: "toemrer", label: "Tømrer" },
  { value: "maler", label: "Maler" },
  { value: "murer", label: "Murer" },
  { value: "andet", label: "Andet" }
] as const;

export const OfferTimeForm = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [service, setService] = useState<(typeof SERVICE_OPTIONS)[number]["value"]>("gulv");
  const [note, setNote] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/leads/tilbudstid/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          postalCode: postalCode.trim(),
          service,
          note: note.trim() || undefined
        })
      });

      const payload = (await response.json()) as { leadId?: string; message?: string };

      if (!response.ok || !payload.leadId) {
        setErrorMessage(payload.message || "Der opstod en fejl. Prøv igen.");
        return;
      }

      trackEvent("tilbudstid_submit", {
        service,
        has_note: Boolean(note.trim())
      });

      router.push(`/tilbudstid/tak?id=${encodeURIComponent(payload.leadId)}`);
    } catch (error) {
      console.error(error);
      setErrorMessage("Der opstod en netværksfejl. Prøv igen.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="grid gap-4 pt-2 md:max-w-xl" onSubmit={submitForm}>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-foreground" htmlFor="name">
          Navn
        </label>
        <input
          id="name"
          name="name"
          type="text"
          className="h-10 rounded-md border border-border bg-white/80 px-3 text-sm text-foreground"
          placeholder="Dit navn"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-foreground" htmlFor="phone">
          Telefon
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          className="h-10 rounded-md border border-border bg-white/80 px-3 text-sm text-foreground"
          placeholder="00 00 00 00"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          required
        />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-foreground" htmlFor="postalCode">
          Postnr.
        </label>
        <input
          id="postalCode"
          name="postalCode"
          type="text"
          inputMode="numeric"
          className="h-10 rounded-md border border-border bg-white/80 px-3 text-sm text-foreground"
          placeholder="4000"
          value={postalCode}
          onChange={(event) => setPostalCode(event.target.value.replace(/\D/g, "").slice(0, 4))}
          required
        />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-foreground" htmlFor="service">
          Ydelse
        </label>
        <select
          id="service"
          name="service"
          className="h-10 rounded-md border border-border bg-white/80 px-3 text-sm text-foreground"
          value={service}
          onChange={(event) => setService(event.target.value as typeof service)}
        >
          {SERVICE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-foreground" htmlFor="note">
          Beskrivelse (valgfri)
        </label>
        <textarea
          id="note"
          name="note"
          rows={4}
          className="rounded-md border border-border bg-white/80 px-3 py-2 text-sm text-foreground"
          placeholder="Kort beskrivelse af opgaven"
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Sender..." : "Send forespørgsel"}
      </Button>
      {errorMessage ? <p className="text-sm font-medium text-red-700">{errorMessage}</p> : null}
    </form>
  );
};
