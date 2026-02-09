import { IntentPageTemplate } from "@/components/bordplade/IntentPageTemplate";
import { intentPages } from "@/lib/bordplade/intent-data";
import { buildMetadata } from "@/lib/seo";

const pageData = intentPages.valnoed;

export const metadata = buildMetadata({
  title: pageData.metaTitle,
  description: pageData.metaDescription,
  path: pageData.path
});

export default function ValnoedPage() {
  return <IntentPageTemplate data={pageData} />;
}
