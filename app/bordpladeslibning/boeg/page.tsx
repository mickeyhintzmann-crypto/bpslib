import { IntentPageTemplate } from "@/components/bordplade/IntentPageTemplate";
import { intentPages } from "@/lib/bordplade/intent-data";
import { buildMetadata } from "@/lib/seo";

const pageData = intentPages.boeg;

export const metadata = buildMetadata({
  title: pageData.metaTitle,
  description: pageData.metaDescription,
  path: pageData.path
});

export default function BoegPage() {
  return <IntentPageTemplate data={pageData} />;
}
