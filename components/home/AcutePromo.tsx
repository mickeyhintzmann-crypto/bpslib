import Link from "next/link";

import { Button } from "@/components/ui/button";

const slots = [
  { label: "I morgen", time: "09:00-12:00", price: "3.000 kr." },
  { label: "Onsdag", time: "13:00-16:00", price: "3.000 kr." },
  { label: "Fredag", time: "08:00-11:00", price: "3.000 kr." }
];

export const AcutePromo = () => {
  return (
    <section className="py-10 md:py-16">
      <div className="rounded-[32px] bg-gradient-to-br from-[#d97706] via-[#cf6d05] to-[#b45309] px-6 py-10 text-white md:px-12">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
              Begrænset tilbud
            </span>
            <h2 className="text-3xl font-semibold md:text-4xl">Akutte tider – Kun 3.000 kr.</h2>
            <p className="text-sm text-white/80 md:text-base">
              Har du en fleksibel kalender? Udnyt vores akutte tider og få professionel slibning af
              din bordplade til fast pris. Vi viser ledige tider live de næste 14 dage.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                "Samme høje kvalitet",
                "Fast pris: 3.000 kr.",
                "Hurtig udførelse"
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl bg-white/10 px-4 py-3 text-xs font-semibold text-white/90"
                >
                  {item}
                </div>
              ))}
            </div>
            <Button asChild className="bg-white text-[#b45309] hover:bg-white/90">
              <Link href="/akutte-tider">Se ledige tider</Link>
            </Button>
          </div>
          <div className="rounded-3xl bg-white p-6 text-foreground shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">Akutte tider</h3>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                Ledige nu
              </span>
            </div>
            <div className="mt-4 grid gap-3">
              {slots.map((slot) => (
                <div key={slot.label} className="flex items-center justify-between rounded-2xl border border-border/70 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{slot.label}</p>
                    <p className="text-xs text-muted-foreground">{slot.time}</p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {slot.price}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
