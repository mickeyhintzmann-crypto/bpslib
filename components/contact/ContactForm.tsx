"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/tracking";

type SubmitState = {
  status: "idle" | "loading" | "error";
  message: string;
};

const initialState: SubmitState = {
  status: "idle",
  message: ""
};

export const ContactForm = () => {
  const router = useRouter();
  const [state, setState] = useState<SubmitState>(initialState);
  const [formData, setFormData] = useState({
    navn: "",
    telefon: "",
    email: "",
    besked: "",
    postnr: "",
    website: ""
  });

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setState({ status: "loading", message: "Sender din besked..." });

    try {
      const response = await fetch("/api/leads/contact/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: formData.navn,
          phone: formData.telefon,
          email: formData.email,
          message: formData.besked,
          postalCode: formData.postnr,
          website: formData.website
        })
      });

      const payload = (await response.json().catch(() => ({}))) as { message?: string; leadId?: string };

      if (!response.ok) {
        setState({
          status: "error",
          message: payload.message || "Der opstod en fejl. Prøv igen om lidt."
        });
        return;
      }

      trackEvent("contact_submit", {
        has_email: Boolean(formData.email.trim()),
        has_postal_code: Boolean(formData.postnr.trim())
      });

      const id = payload.leadId ? `?id=${encodeURIComponent(payload.leadId)}` : "";
      router.push(`/kontakt/tak${id}`);
    } catch {
      setState({
        status: "error",
        message: "Forbindelsen fejlede. Prøv igen eller ring direkte til os."
      });
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-3xl border border-border/70 bg-white/80 p-5 md:p-6"
    >
      <h2 className="text-xl font-semibold text-foreground">Skriv til os</h2>
      <p className="text-sm text-muted-foreground">
        Udfyld felterne herunder. Vi bruger kun oplysningerne til at kontakte dig om din henvendelse.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-1 text-sm text-foreground">
          Navn *
          <input
            type="text"
            required
            value={formData.navn}
            onChange={(event) => setFormData((prev) => ({ ...prev, navn: event.target.value }))}
            className="h-10 rounded-md border border-border bg-background px-3 text-sm"
            placeholder="Dit navn"
          />
        </label>

        <label className="grid gap-1 text-sm text-foreground">
          Telefon *
          <input
            type="tel"
            required
            value={formData.telefon}
            onChange={(event) => setFormData((prev) => ({ ...prev, telefon: event.target.value }))}
            className="h-10 rounded-md border border-border bg-background px-3 text-sm"
            placeholder="Fx 26 91 37 37"
          />
        </label>
      </div>

      <label className="grid gap-1 text-sm text-foreground">
        Email *
        <input
          type="email"
          required
          value={formData.email}
          onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
          className="h-10 rounded-md border border-border bg-background px-3 text-sm"
          placeholder="din@email.dk"
        />
      </label>

      <label className="grid gap-1 text-sm text-foreground">
        Besked *
        <textarea
          required
          value={formData.besked}
          onChange={(event) => setFormData((prev) => ({ ...prev, besked: event.target.value }))}
          className="min-h-[120px] rounded-md border border-border bg-background px-3 py-2 text-sm"
          placeholder="Fortæl kort om opgaven"
        />
      </label>

      <label className="grid gap-1 text-sm text-foreground">
        Postnr. (valgfri)
        <input
          type="text"
          value={formData.postnr}
          onChange={(event) =>
            setFormData((prev) => ({ ...prev, postnr: event.target.value.replace(/\D/g, "").slice(0, 4) }))
          }
          className="h-10 rounded-md border border-border bg-background px-3 text-sm"
          placeholder="4000"
          inputMode="numeric"
        />
      </label>

      <label className="hidden" aria-hidden>
        Hjemmeside
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={formData.website}
          onChange={(event) => setFormData((prev) => ({ ...prev, website: event.target.value }))}
        />
      </label>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={state.status === "loading"}>
          {state.status === "loading" ? "Sender..." : "Send besked"}
        </Button>
      </div>

      {state.message ? (
        <p className={`text-sm ${state.status === "error" ? "text-red-700" : "text-muted-foreground"}`}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
};
