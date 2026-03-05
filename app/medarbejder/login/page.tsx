"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export default function EmployeeLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "setup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [activationCode, setActivationCode] = useState("");
  const [setupPassword, setSetupPassword] = useState("");
  const [setupPasswordRepeat, setSetupPasswordRepeat] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const login = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Indtast email og adgangskode.");
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password.trim()
        })
      });

      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        setError(payload.message || "Kunne ikke logge ind.");
        return;
      }

      router.push("/medarbejder/kalender");
      router.refresh();
    } catch (fetchError) {
      console.error(fetchError);
      setError("Netværksfejl ved login.");
    } finally {
      setBusy(false);
    }
  };

  const setup = async () => {
    if (!email.trim() || !activationCode.trim() || !setupPassword.trim() || !setupPasswordRepeat.trim()) {
      setError("Udfyld email, aktiveringskode og kodeord.");
      return;
    }
    if (setupPassword.trim().length < 8) {
      setError("Kodeord skal være mindst 8 tegn.");
      return;
    }
    if (setupPassword.trim() !== setupPasswordRepeat.trim()) {
      setError("Kodeordene er ikke ens.");
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/employee/auth/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          activationCode: activationCode.trim().toUpperCase(),
          password: setupPassword.trim()
        })
      });
      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        setError(payload.message || "Kunne ikke oprette kodeord.");
        return;
      }

      setMessage("Kodeord oprettet. Du kan nu logge ind.");
      setMode("login");
      setPassword("");
      setActivationCode("");
      setSetupPassword("");
      setSetupPasswordRepeat("");
    } catch (fetchError) {
      console.error(fetchError);
      setError("Netværksfejl ved opsætning.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-6 py-16">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-semibold text-foreground">Medarbejder login</h1>
        <p className="text-sm text-muted-foreground">
          Log ind for at se din kalender og dine opgaver, eller opret kode første gang.
        </p>
      </header>

      <div className="space-y-3 rounded-2xl border border-border/70 bg-white/70 p-6">
        <div className="flex gap-2">
          <Button variant={mode === "login" ? "default" : "outline"} onClick={() => setMode("login")} disabled={busy}>
            Log ind
          </Button>
          <Button variant={mode === "setup" ? "default" : "outline"} onClick={() => setMode("setup")} disabled={busy}>
            Første gang
          </Button>
        </div>

        <label className="grid gap-2 text-sm text-foreground">
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-10 rounded-md border border-border bg-white px-3 text-sm"
            placeholder="medarbejder@bpslib.dk"
          />
        </label>

        {mode === "login" ? (
          <label className="grid gap-2 text-sm text-foreground">
            Adgangskode
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-10 rounded-md border border-border bg-white px-3 text-sm"
            />
          </label>
        ) : (
          <>
            <label className="grid gap-2 text-sm text-foreground">
              Aktiveringskode
              <input
                value={activationCode}
                onChange={(event) => setActivationCode(event.target.value)}
                className="h-10 rounded-md border border-border bg-white px-3 text-sm uppercase"
                placeholder="fx 6A9F1C2D"
              />
            </label>
            <label className="grid gap-2 text-sm text-foreground">
              Nyt kodeord
              <input
                type="password"
                value={setupPassword}
                onChange={(event) => setSetupPassword(event.target.value)}
                className="h-10 rounded-md border border-border bg-white px-3 text-sm"
              />
            </label>
            <label className="grid gap-2 text-sm text-foreground">
              Gentag kodeord
              <input
                type="password"
                value={setupPasswordRepeat}
                onChange={(event) => setSetupPasswordRepeat(event.target.value)}
                className="h-10 rounded-md border border-border bg-white px-3 text-sm"
              />
            </label>
          </>
        )}

        {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
        {message ? <p className="text-sm font-medium text-emerald-700">{message}</p> : null}
        <Button onClick={mode === "login" ? login : setup} disabled={busy}>
          {busy ? "Arbejder..." : mode === "login" ? "Log ind" : "Opret kodeord"}
        </Button>
      </div>

      <section className="space-y-3 rounded-2xl border border-border/70 bg-white/70 p-6">
        <h2 className="text-base font-semibold text-foreground">Guide: Forbind Dinero</h2>
        <p className="text-sm text-muted-foreground">
          Brug denne korte guide første gang, eller hvis Organization-id/API-nøgle skal opdateres.
        </p>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-foreground">
          <li>Log ind og gå til boksen <strong>Dinero fakturering</strong> på kalender-siden.</li>
          <li>Find dit <strong>Organization-id</strong> og en gyldig <strong>Dinero API-nøgle</strong> i Dinero.</li>
          <li>Indsæt begge felter og klik <strong>Forbind Dinero</strong>.</li>
          <li>Når status viser <strong>Forbundet</strong>, er opsætningen færdig.</li>
        </ol>
        <p className="text-xs text-muted-foreground">
          Sikkerhed: Del ikke API-nøglen i mail/chat. Ved tvivl, opret en ny nøgle i Dinero og opdater forbindelsen.
        </p>
      </section>
    </main>
  );
}
