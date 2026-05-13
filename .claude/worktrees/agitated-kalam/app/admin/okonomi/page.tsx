import { EconomyAdmin } from "@/components/admin/EconomyAdmin";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Økonomi | Admin",
  description: "Omsætning og statistik for driften.",
  path: "/admin/okonomi"
});

export default function AdminOkonomiPage() {
  return <EconomyAdmin />;
}
