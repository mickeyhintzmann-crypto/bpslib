import Link from "next/link";

import { Button } from "@/components/ui/button";

type CtaRowProps = {
  showAkutteTider?: boolean;
  primaryLabel?: string;
};

export const CtaRow = ({
  showAkutteTider = false,
  primaryLabel = "Få pris via billeder"
}: CtaRowProps) => {
  return (
    <div className="flex flex-wrap gap-3">
      <Button asChild>
        <Link href="/bordpladeslibning/prisberegner">{primaryLabel}</Link>
      </Button>
      <Button asChild variant="outline">
        <Link href="/bordpladeslibning/book">Book tid</Link>
      </Button>
      {showAkutteTider ? (
        <Button asChild variant="secondary">
          <Link href="/akutte-tider">Akutte tider</Link>
        </Button>
      ) : null}
    </div>
  );
};
