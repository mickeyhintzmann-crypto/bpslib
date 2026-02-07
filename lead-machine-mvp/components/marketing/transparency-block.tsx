export function TransparencyBlock() {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
      <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Transparency</p>
      <h2 className="mt-3 font-display text-3xl text-white">
        Concierge guidance with clear boundaries
      </h2>
      <p className="mt-3 text-sm text-neutral-300">
        We curate, introduce, and keep the process moving. Partners handle negotiations,
        contracts, deposits, and closing. We may earn referral fees, but our priority is a
        buyer-first shortlist and a clean, low-pressure experience.
      </p>
      <ul className="mt-6 grid gap-3 text-sm text-neutral-200 md:grid-cols-2">
        <li className="rounded-2xl border border-white/10 bg-neutral-900/60 px-4 py-3">
          We are not a real estate agent or law firm.
        </li>
        <li className="rounded-2xl border border-white/10 bg-neutral-900/60 px-4 py-3">
          We do not negotiate price, hold funds, or draft contracts.
        </li>
        <li className="rounded-2xl border border-white/10 bg-neutral-900/60 px-4 py-3">
          We only introduce vetted partners after you approve the shortlist.
        </li>
        <li className="rounded-2xl border border-white/10 bg-neutral-900/60 px-4 py-3">
          We’re buyer-first, even when partners compensate us for introductions.
        </li>
      </ul>
    </section>
  );
}
