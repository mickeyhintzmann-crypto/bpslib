import { IntentPageTemplate } from "@/components/bordplade/IntentPageTemplate";
import { intentPages } from "@/lib/bordplade/intent-data";
import { buildMetadata } from "@/lib/seo";

const pageData = intentPages.lak;

export const metadata = buildMetadata({
  title: pageData.metaTitle,
  description: pageData.metaDescription,
  path: pageData.path
});

export default function LakPage() {
  return <IntentPageTemplate data={pageData} />;
}
