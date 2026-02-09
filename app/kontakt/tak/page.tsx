import Link from "next/link";

import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";

type KontaktTakPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
};

export const metadata = {
  ...buildMetadata({
    title: "Tak for din henvendelse",
    description: "Tak for din henvendelse. Vi vender tilbage hurtigst muligt.",
    path: "/kontakt/tak"
  }),
  robots: {
    index: false,
    follow: false,
    nocache: true
  }
};

const resolveLeadId = (raw: string | string[] | undefined) => {
  if (typeof raw === "string") {
    return raw.trim();
  }
  if (Array.isArray(raw) && raw[0]) {
    return raw[0].trim();
  }
  return "";
};

export default async function KontaktTakPage({ searchParams }: KontaktTakPageProps) {
  const params = await Promise.resolve(searchParams ?? {});
  const leadId = resolveLeadId(params.id);

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-16">
      <section className="space-y-5 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-10">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Tak - vi vender tilbage hurtigst muligt
        </h1>
        {leadId ? (
          <p className="text-sm text-muted-foreground md:text-base">
            Henvendelses-ID: <span className="font-semibold text-foreground">{leadId}</span>
          </p>
        ) : null}
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href="/kontakt">Kontakt</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
