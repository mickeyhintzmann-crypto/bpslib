export function WhatYouReceive({
  areaName,
  intentName
}: {
  areaName: string;
  intentName: string;
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-neutral-900/60 p-6">
      <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">What you’ll receive</p>
      <ul className="mt-4 grid gap-3 text-sm text-neutral-200 md:grid-cols-3">
        <li className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          5–10 {intentName.toLowerCase()} options in {areaName} with clear trade-offs.
        </li>
        <li className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          Micro-zone guidance for {areaName} based on walkability, views, and lifestyle.
        </li>
        <li className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          Partner introductions for viewings, legal, and finance—only when you’re ready.
        </li>
      </ul>
    </section>
  );
}
