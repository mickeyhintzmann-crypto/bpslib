import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { cases as fallbackCases, type CaseItem } from "@/lib/cases-data";
import { isLocalImageAvailable } from "@/lib/image-utils";

const hasSupabaseEnv = () =>
  Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

const mapCaseRow = (row: any): CaseItem => ({
  id: row.id,
  category: row.category,
  title: row.title,
  location: row.location,
  finish: row.finish,
  problem: row.problem,
  beforeImage: row.before_image,
  afterImage: row.after_image || null,
  beforeAlt: row.before_alt || row.title,
  afterAlt: row.after_alt || row.title
});

const hasRequiredImages = (item: CaseItem) => {
  if (!isLocalImageAvailable(item.beforeImage)) {
    return false;
  }

  if (item.category === "bordplade") {
    if (!item.afterImage) {
      return false;
    }
    return isLocalImageAvailable(item.afterImage);
  }

  if (item.afterImage) {
    return isLocalImageAvailable(item.afterImage);
  }

  return true;
};

export const getCases = async (): Promise<CaseItem[]> => {
  if (!hasSupabaseEnv()) {
    return fallbackCases.filter(hasRequiredImages);
  }

  try {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("cases")
      .select(
        "id, category, title, location, finish, problem, before_image, after_image, before_alt, after_alt, status"
      )
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (error || !data) {
      return fallbackCases.filter(hasRequiredImages);
    }

    return data.map(mapCaseRow).filter(hasRequiredImages);
  } catch (error) {
    console.error(error);
    return fallbackCases.filter(hasRequiredImages);
  }
};
