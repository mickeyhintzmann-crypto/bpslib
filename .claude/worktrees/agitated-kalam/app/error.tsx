"use client";

import { useEffect } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
        Noget gik galt
      </h1>
      <div className="mt-6 space-y-4 text-base leading-relaxed text-muted-foreground">
        <p>
          Der opstod en fejl. Prøv igen, eller gå tilbage til forsiden. Hvis problemet fortsætter,
          er du velkommen til at kontakte os.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Button onClick={reset}>Prøv igen</Button>
          <Button asChild variant="outline">
            <Link href="/">Gå til forsiden</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
