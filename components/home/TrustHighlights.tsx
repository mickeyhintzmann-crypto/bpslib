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
    <section className="py-10 md:py-14">
      <div className="grid gap-6 md:grid-cols-3">
        {highlights.map(({ title, text, Icon }) => (
          <div key={title} className="rounded-3xl border border-border/70 bg-white/80 p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-primary">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="text-base font-semibold text-foreground">{title}</h3>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
