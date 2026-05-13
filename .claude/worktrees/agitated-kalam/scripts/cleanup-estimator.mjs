import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucket = "estimator-images";

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Mangler SUPABASE_URL eller SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

const now = new Date().toISOString();

const { data: expiredRows, error: selectError } = await supabase
  .from("estimator_requests")
  .select("id, images")
  .lte("retention_delete_at", now)
  .limit(500);

if (selectError) {
  console.error("Kunne ikke hente udløbne estimator-requests:", selectError.message);
  process.exit(1);
}

if (!expiredRows || expiredRows.length === 0) {
  console.log("Ingen udløbne estimator-requests fundet.");
  process.exit(0);
}

const storagePaths = expiredRows
  .flatMap((row) => (Array.isArray(row.images) ? row.images : []))
  .map((entry) => {
    if (typeof entry === "string") {
      return entry;
    }
    if (entry && typeof entry === "object" && "path" in entry) {
      return entry.path;
    }
    return null;
  })
  .filter((path) => typeof path === "string" && path.length > 0);

if (storagePaths.length > 0) {
  const { error: removeError } = await supabase.storage.from(bucket).remove(storagePaths);
  if (removeError) {
    console.error("Kunne ikke slette billeder fra storage:", removeError.message);
    process.exit(1);
  }
}

const ids = expiredRows.map((row) => row.id);
const { error: deleteError } = await supabase.from("estimator_requests").delete().in("id", ids);

if (deleteError) {
  console.error("Kunne ikke slette udløbne estimator-requests:", deleteError.message);
  process.exit(1);
}

console.log(`Slettet ${ids.length} udløbne estimator-requests.`);
