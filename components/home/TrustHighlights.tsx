import { SparklesIcon, ShieldIcon, TimerIcon } from "@/components/home/icons";

const highlights = [
  {
    title: "Hurtig proces",
    text: "De fleste bordplader klares på en dag, så du hurtigt kan bruge køkkenet igen.",
    Icon: TimerIcon
  },
  {
    title: "Ofte billigere end ny bordplade",
    text: "Slibning og olie giver et nyt look til en brøkdel af prisen for udskiftning.",
    Icon: SparklesIcon
  },
  {
    title: "Kvalitet der holder",
    text: "Vi arbejder grundigt og bruger kun materialer vi kan stå inde for.",
    Icon: ShieldIcon
  }
];

export const TrustHighlights = () => {
  return (
    <section className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 bg-[hsl(230_26%_95%)] py-16 md:py-20">
      <div className="mx-auto w-full max-w-[1180px] px-4 md:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            Din garanti for en god oplevelse
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            Hvorfor kunder vælger os
          </h2>
        </div>

        <div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          {highlights.map(({ title, text, Icon }) => (
            <div key={title} className="mx-auto flex max-w-sm flex-col items-center text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full border border-primary/35 bg-white text-primary">
                <Icon className="h-8 w-8" />
              </span>
              <h3 className="mt-6 text-3xl font-semibold text-foreground md:text-[32px]">
                {title}
              </h3>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground md:text-xl">
                {text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
