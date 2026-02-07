import { LeadFormTrigger } from "@/components/lead/lead-form-trigger";
import { WhatsAppButton } from "@/components/marketing/whatsapp-button";

export function CtaBand({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-display text-3xl text-white">{title}</h2>
          <p className="mt-2 text-sm text-neutral-300">{subtitle}</p>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-3">
            <LeadFormTrigger className="text-xs uppercase tracking-[0.2em]" />
            <WhatsAppButton className="text-xs uppercase tracking-[0.2em]" />
          </div>
          <p className="text-xs text-neutral-400">No spam. We reply fast.</p>
        </div>
      </div>
    </section>
  );
}
