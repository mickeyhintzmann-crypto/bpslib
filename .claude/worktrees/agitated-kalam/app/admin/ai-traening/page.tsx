import { AiTrainingAdmin } from "@/components/admin/AiTrainingAdmin";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "AI træning | Admin",
  description: "Upload træningscases til AI-prisberegneren.",
  path: "/admin/ai-traening"
});

export default function AiTrainingPage() {
  return <AiTrainingAdmin />;
}
