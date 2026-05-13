import { AdminUsers } from "@/components/admin/AdminUsers";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Medarbejdere | Admin",
  description: "Administrer roller og adgang for medarbejdere.",
  path: "/admin/medarbejdere"
});

export default function AdminMedarbejderePage() {
  return <AdminUsers />;
}
