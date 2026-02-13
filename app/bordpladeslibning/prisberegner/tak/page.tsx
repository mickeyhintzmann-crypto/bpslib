import { EstimatorTakClient } from "@/components/estimator/EstimatorTakClient";
import type { EstimatorFormFields } from "@/lib/estimator";
import { estimateAiPrice } from "@/lib/ai-estimator";
import { buildMetadata } from "@/lib/seo";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export const metadata = {
  ...buildMetadata({
    title: "Tak for din vurdering",
    description:
      "Tak for din prisforespørgsel. Vi har modtaget billederne og vender hurtigt tilbage med vurdering.",
    path: "/bordpladeslibning/prisberegner/tak"
  }),
  robots: {
    index: false,
    follow: false,
    nocache: true
  }
};

type TakPageProps = {
  searchParams?:
    | Record<string, string | string[] | undefined>
    | Promise<Record<string, string | string[] | undefined>>;
};

const getParam = (value: string | string[] | undefined) => {
  if (typeof value === "string") {
    return value.trim();
  }
  if (Array.isArray(value) && value[0]) {
    return value[0].trim();
  }
  return "";
};

export default async function PrisberegnerTakPage({ searchParams }: TakPageProps) {
  const params = (await searchParams) ?? {};
  const id = getParam(params.id);
  const min = getParam(params.min);
  const max = getParam(params.max);
  const status = getParam(params.status);

  let minValue = min && /^\d+$/.test(min) ? Number.parseInt(min, 10) : null;
  let maxValue = max && /^\d+$/.test(max) ? Number.parseInt(max, 10) : null;
  let resolvedStatus = status;
  let hasEstimate = minValue !== null && maxValue !== null && minValue <= maxValue;

  if (!hasEstimate && id) {
    try {
      const supabase = createSupabaseServiceClient();
      const { data } = await supabase
        .from("estimator_requests")
        .select("ai_price_min, ai_price_max, fields")
        .eq("id", id)
        .maybeSingle();

      const aiMin = data?.ai_price_min ?? null;
      const aiMax = data?.ai_price_max ?? null;

      if (typeof aiMin === "number" && typeof aiMax === "number") {
        minValue = aiMin;
        maxValue = aiMax;
        hasEstimate = aiMin <= aiMax;
        resolvedStatus = resolvedStatus || "estimated";
      } else if (data?.fields) {
        const estimate = await estimateAiPrice(supabase, {
          fields: data.fields as EstimatorFormFields
        });
        if (estimate) {
          minValue = estimate.min;
          maxValue = estimate.max;
          hasEstimate = estimate.min <= estimate.max;
          resolvedStatus = resolvedStatus || "estimated";
        }
      }
    } catch (error) {
      console.error("Kunne ikke hente AI-estimat til tak-side:", error);
    }
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-16">
      <section className="space-y-5 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-10">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Tak - vi har modtaget dine billeder
        </h1>
        <EstimatorTakClient
          id={id}
          initialMin={hasEstimate ? minValue : null}
          initialMax={hasEstimate ? maxValue : null}
          initialStatus={resolvedStatus}
        />
      </section>
    </main>
  );
}
