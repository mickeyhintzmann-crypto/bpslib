import Link from "next/link";

import { Button } from "@/components/ui/button";

const services = [
  {
    title: "Gulvafslibning",
    text: "Vi hjælper med vurdering og tilbud på gulvafslibning på Sjælland.",
    href: "/tilbudstid"
  },
  {
    title: "Tømrer",
    text: "Tømreropgaver håndteres som lead-gen i MVP.",
    href: "/tilbudstid"
  },
  {
    title: "Maler",
    text: "Maleropgaver samles via tilbudstid og vurderes manuelt.",
    href: "/tilbudstid"
  },
  {
    title: "Murer",
    text: "Mureropgaver behandles som lead-gen i MVP.",
    href: "/tilbudstid"
  }
];

export const SecondaryServices = () => {
  return (
    <section className="py-10 md:py-16">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Andre ydelser</h2>
        <p className="text-sm text-muted-foreground">
          Har du andre opgaver end bordplader? Send en kort forespørgsel, så vender vi tilbage.
        </p>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {services.map((service) => (
          <div key={service.title} className="rounded-2xl border border-border/70 bg-white/70 p-5">
            <h3 className="text-base font-semibold text-foreground">{service.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{service.text}</p>
            <Button asChild variant="outline" className="mt-4 w-full">
              <Link href={service.href}>Book uforpligtende tilbudstid</Link>
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
};
