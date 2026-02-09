import { BpsImage } from "@/components/BpsImage";
import { getCaseAsset } from "@/lib/assets";

type MiniCaseProps = {
  caseSlug?: string;
  title: string;
  problem: string;
  solution: string;
  outcome: string;
};

export const MiniCase = ({ caseSlug, title, problem, solution, outcome }: MiniCaseProps) => {
  const caseAsset = getCaseAsset(caseSlug);

  return (
    <section className="py-10 md:py-12">
      <div className="rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Mini-case: {title}</h2>
        <div className="mt-5 grid gap-6 md:grid-cols-[1fr_1fr] md:items-start">
          <div className="grid gap-3 sm:grid-cols-2">
            <figure className="space-y-2">
              <BpsImage
                src={caseAsset.before.src}
                alt={caseAsset.before.alt}
                width={1200}
                height={900}
                className="h-full w-full rounded-2xl object-cover"
              />
              <figcaption className="text-xs text-muted-foreground">Før</figcaption>
            </figure>
            <figure className="space-y-2">
              <BpsImage
                src={caseAsset.after.src}
                alt={caseAsset.after.alt}
                width={1200}
                height={900}
                className="h-full w-full rounded-2xl object-cover"
              />
              <figcaption className="text-xs text-muted-foreground">Efter</figcaption>
            </figure>
          </div>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              <span className="font-semibold text-foreground">Problem:</span> {problem}
            </p>
            <p>
              <span className="font-semibold text-foreground">Løsning:</span> {solution}
            </p>
            <p>
              <span className="font-semibold text-foreground">Finish:</span> {outcome}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
