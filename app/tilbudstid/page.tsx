import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Tilbudstid",
  description: "Få et hurtigt tilbud på opgaver uden for bordplader. Vi vender tilbage med en konkret pris.",
  path: "/tilbudstid"
});

export default function TilbudstidPage() {
  return (
    <PageShell title="Tilbudstid for øvrige fag">
      <p>
        Har du en opgave inden for gulv, maler, murer eller tømrer? Send en kort beskrivelse, så
        vender vi tilbage med et tilbud.
      </p>
      <p>Online booking er ikke aktiv i MVP, men vi svarer hurtigt på din forespørgsel.</p>
      <form className="grid gap-4 pt-2 md:max-w-xl">
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
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-foreground" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="h-10 rounded-md border border-border bg-white/80 px-3 text-sm text-foreground"
            placeholder="din@mail.dk"
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-foreground" htmlFor="message">
            Beskrivelse
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            className="rounded-md border border-border bg-white/80 px-3 py-2 text-sm text-foreground"
            placeholder="Kort beskrivelse af opgaven"
          />
        </div>
        <Button type="button">Send forespørgsel</Button>
      </form>
    </PageShell>
  );
}
