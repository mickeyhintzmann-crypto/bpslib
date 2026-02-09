import Link from "next/link";

import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

type BookTakPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
};

export const metadata = {
  ...buildMetadata({
    title: "Tak for din forespørgsel",
    description: "Tak for din forespørgsel. Vi vender tilbage med pris og endelig bekræftelse.",
    path: "/bordpladeslibning/book/tak"
  }),
  robots: {
    index: false,
    follow: false,
    nocache: true
  }
};

const resolveBookingId = (raw: string | string[] | undefined) => {
  if (typeof raw === "string") {
    return raw.trim();
  }
  if (Array.isArray(raw) && raw[0]) {
    return raw[0].trim();
  }
  return "";
};

const resolveManageToken = async (bookingId: string) => {
  if (!bookingId) {
    return "";
  }
  try {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("bookings")
      .select("manage_token")
      .eq("id", bookingId)
      .single();
    if (error || !data?.manage_token) {
      return "";
    }
    return data.manage_token;
  } catch (error) {
    console.error(error);
    return "";
  }
};

export default async function BookTakPage({ searchParams }: BookTakPageProps) {
  const params = await Promise.resolve(searchParams ?? {});
  const bookingId = resolveBookingId(params.id);
  const manageToken = bookingId ? await resolveManageToken(bookingId) : "";

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-16">
      <section className="space-y-5 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-10">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Tak - vi har modtaget din forespørgsel
        </h1>
        {bookingId ? (
          <p className="text-sm text-muted-foreground md:text-base">
            Booking-ID: <span className="font-semibold text-foreground">{bookingId}</span>
          </p>
        ) : null}
        {manageToken ? (
          <p className="text-sm text-muted-foreground md:text-base">
            Aflys eller ombook:{" "}
            <Link className="font-semibold text-foreground underline" href={`/booking/manage/${manageToken}`}>
              Administrer booking
            </Link>
          </p>
        ) : null}
        <p className="text-sm text-muted-foreground md:text-base">
          Vi vender tilbage med pris og endelig bekræftelse hurtigst muligt.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href="/kontakt">Kontakt</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/handelsbetingelser">Handelsbetingelser</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
