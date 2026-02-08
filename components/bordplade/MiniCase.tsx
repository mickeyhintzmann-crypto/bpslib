import Image from "next/image";

type MiniCaseProps = {
  title: string;
  problem: string;
  solution: string;
  outcome: string;
};

const placeholder = (title: string) => {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='960' height='540'>
    <rect width='100%' height='100%' fill='#efe0cd'/>
    <rect x='24' y='24' width='912' height='492' rx='28' fill='#ffffff' stroke='#d3b998' stroke-width='2'/>
    <text x='50%' y='50%' text-anchor='middle' font-family='Arial' font-size='30' fill='#8f6a41'>${title}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const MiniCase = ({ title, problem, solution, outcome }: MiniCaseProps) => {
  return (
    <section className="py-10 md:py-12">
      <div className="rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Mini-case: {title}</h2>
        <div className="mt-5 grid gap-6 md:grid-cols-[0.9fr_1.1fr] md:items-center">
          <Image
            src={placeholder(title)}
            alt={`Pladsholder til case: ${title}`}
            width={960}
            height={540}
            className="h-full w-full rounded-2xl object-cover"
            unoptimized
          />
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
