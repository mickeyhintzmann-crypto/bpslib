import Link from "next/link";

export const SurfaceGuide = () => {
  return (
    <section className="py-10 md:py-16">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Hvad kan reddes på en massiv træbordplade?</h2>
          <p className="text-sm text-muted-foreground">
            Når en massiv træbordplade bliver slidt, er det sjældent nødvendigt at udskifte den.
            Slibning fjerner de øverste millimeter, så overfladen bliver jævn og klar igen. Vi
            vurderer altid trætype og tykkelse først, så vi kun sliber når det er sikkert – og når
            resultatet bliver bedst muligt.
          </p>
          <p className="text-sm text-muted-foreground">
            Bordpladeslibning er en skånsom måde at få bordpladen flot igen, uden at miste den varme
            og naturlige karakter. Vi ser især disse problemer, som ofte kan udbedres:
          </p>
          <ul className="grid gap-2 text-sm text-muted-foreground">
            <li>• Vand- og varmeskjolder efter daglig brug</li>
            <li>• Ridser, hak og små ujævnheder i overfladen</li>
            <li>• Brændemærker eller mørke pletter omkring vask</li>
            <li>• Slidte, matte felter hvor finishen er forsvundet</li>
          </ul>
        </div>
        <div className="space-y-4 rounded-3xl border border-border/70 bg-white/70 p-6">
          <h3 className="text-xl font-semibold text-foreground">Finish og vedligehold</h3>
          <p className="text-sm text-muted-foreground">
            Efter slibning vælger vi den finish, der passer til din hverdag. Olie giver et naturligt
            udtryk og er nemt at vedligeholde, mens lak giver en mere slidstærk overflade. Vi kan
            også lave sæbebehandling, men i køkkener anbefaler vi typisk olie eller lak, fordi de
            tåler mere.
          </p>
          <p className="text-sm text-muted-foreground">
            Vi rådgiver altid ud fra brug, børn, kæledyr og hvor meget bordpladen bruges. Vil du
            læse mere, kan du gå til vores guide om olie eller lak, eller se prisguiden for et
            overblik.
          </p>
          <div className="flex flex-wrap gap-3 text-sm font-semibold text-primary">
            <Link href="/bordpladeslibning/olie-eller-lak">Olie eller lak</Link>
            <Link href="/bordpladeslibning/pris">Se prisguide</Link>
          </div>
        </div>
      </div>
    </section>
  );
};
