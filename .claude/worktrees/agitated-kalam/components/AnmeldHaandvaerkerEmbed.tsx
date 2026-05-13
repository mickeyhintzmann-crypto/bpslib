import Link from "next/link";

import { BpsImage } from "@/components/BpsImage";
import { Button } from "@/components/ui/button";
import { trustAssets } from "@/lib/assets";
import { siteConfig } from "@/lib/site-config";

export const AnmeldHaandvaerkerEmbed = () => {
  const { anmeldHaandvaerker } = siteConfig;

  if (!anmeldHaandvaerker.enabled) {
    return null;
  }

  if (anmeldHaandvaerker.widgetHtml) {
    return (
      <div
        className="rounded-3xl border border-border/70 bg-white/75 p-6 md:p-8"
        dangerouslySetInnerHTML={{ __html: anmeldHaandvaerker.widgetHtml }}
      />
    );
  }

  const profileUrl = anmeldHaandvaerker.profileUrl.trim();
  const hasProfileUrl = profileUrl.length > 0;

  return (
    <section className="rounded-3xl border border-border/70 bg-white/75 p-6 md:p-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <BpsImage
            src={trustAssets.anmeldHaandvaerkerBadge}
            alt="Anmeld-håndværker badge"
            width={260}
            height={120}
            className="h-16 w-auto"
          />
          <p className="text-sm text-muted-foreground">
            Vi samler anmeldelser fra anmeld-haandvaerker.dk. Besøg vores profil for at se seneste
            vurderinger.
          </p>
        </div>
        {hasProfileUrl ? (
          <Button asChild>
            <Link href={profileUrl} target="_blank" rel="noopener noreferrer">
              Se vores anmeldelser
            </Link>
          </Button>
        ) : (
          <Button disabled>Se vores anmeldelser</Button>
        )}
      </div>
    </section>
  );
};
