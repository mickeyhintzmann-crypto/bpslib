"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!password.trim()) {
      setError("Indtast adgangskode.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ password: password.trim() })
      });

      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        setError(payload.message || "Kunne ikke logge ind.");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Netværksfejl ved login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-6 py-16">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-semibold text-foreground">Admin login</h1>
        <p className="text-sm text-muted-foreground">Indtast adgangskoden for at fortsætte.</p>
      </header>

      <div className="space-y-3 rounded-2xl border border-border/70 bg-white/70 p-6">
        <label className="grid gap-2 text-sm text-foreground">
          Adgangskode
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-10 rounded-md border border-border bg-white px-3 text-sm"
          />
        </label>
        {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
        <Button onClick={handleLogin} disabled={loading}>
          {loading ? "Logger ind..." : "Log ind"}
        </Button>
      </div>
    </main>
  );
}
