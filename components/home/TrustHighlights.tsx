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
    <section className="py-8 md:py-10">
      <div className="rounded-[30px] border border-border/70 bg-white/70 p-5 md:p-7">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold text-foreground">Hvorfor kunder vælger os</h2>
          <span className="rounded-full border border-border/70 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Lokalt håndværk
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
        {highlights.map(({ title, text, Icon }) => (
          <div
            key={title}
            className="surface-subtle rounded-[24px] p-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_hsl(20_30%_20%/0.1)]"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-border/70 bg-white text-primary">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="text-base font-semibold text-foreground">{title}</h3>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{text}</p>
          </div>
        ))}
        </div>
      </div>
    </section>
  );
};
