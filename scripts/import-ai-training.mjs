import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

import { createClient } from "@supabase/supabase-js";

const ESTIMATOR_BUCKET = "estimator-images";
const DEFAULT_STATUS = "Lukket";

const csvPath = process.env.TRAINING_CSV || path.join(process.cwd(), "training", "ai-training.csv");
const imagesDir = process.env.TRAINING_IMAGES || path.join(process.cwd(), "training", "images");
const dryRun = process.env.DRY_RUN === "1";

const requiredEnv = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length > 0) {
  console.error(`Manglende env vars: ${missingEnv.join(", ")}`);
  process.exit(1);
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const readCsv = async (filePath) => {
  const content = await fs.readFile(filePath, "utf8");
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"));

  if (lines.length < 2) {
    throw new Error("CSV mangler data. Skal mindst have header + 1 række.");
  }

  const headers = lines[0].split(";").map((h) => h.trim());
  return lines.slice(1).map((line, index) => {
    const values = line.split(";").map((v) => v.trim());
    const row = {};
    headers.forEach((header, i) => {
      row[header] = values[i] ?? "";
    });
    row.__line = index + 2;
    return row;
  });
};

const parseNumber = (value, label, line) => {
  if (!value) {
    return null;
  }
  const normalized = value.replace(",", ".").replace(/[^0-9.]/g, "");
  const parsed = Number.parseFloat(normalized);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Ugyldigt tal i ${label} (linje ${line}).`);
  }
  return Math.round(parsed);
};

const parseExtras = (value, line) => {
  if (!value) {
    return null;
  }
  try {
    return JSON.parse(value);
  } catch {
    throw new Error(`Ugyldig JSON i extras_json (linje ${line}).`);
  }
};

const buildImageList = ({ kitchen, edge, others }) => {
  const list = [kitchen, edge, ...others].filter(Boolean);
  const unique = [...new Set(list)];
  return unique.slice(0, 6);
};

const main = async () => {
  const rows = await readCsv(csvPath);
  let success = 0;

  for (const row of rows) {
    const line = row.__line;
    const caseId = row.case_id || randomUUID();
    const lengthCm = parseNumber(row.length_cm, "length_cm", line);
    const depthCm = parseNumber(row.depth_cm, "depth_cm", line);
    const count = parseNumber(row.count, "count", line);
    const priceMin = parseNumber(row.price_min, "price_min", line);
    const priceMax = parseNumber(row.price_max, "price_max", line);
    const extras = parseExtras(row.extras_json, line);

    if (!lengthCm || !depthCm || !count) {
      throw new Error(`Mangler mål (length_cm/dpeth_cm/count) på linje ${line}.`);
    }
    if (!priceMin || !priceMax) {
      throw new Error(`Mangler price_min/price_max på linje ${line}.`);
    }

    const kitchenImage = row.kitchen_image;
    const edgeImage = row.edge_image;
    const otherImages = row.other_images ? row.other_images.split("|").map((item) => item.trim()) : [];

    if (!kitchenImage || !edgeImage) {
      throw new Error(`Mangler kitchen_image eller edge_image på linje ${line}.`);
    }

    const imageNames = buildImageList({ kitchen: kitchenImage, edge: edgeImage, others: otherImages });
    const imageFiles = await Promise.all(
      imageNames.map(async (name) => {
        const fullPath = path.join(imagesDir, name);
        await fs.access(fullPath);
        const file = await fs.readFile(fullPath);
        return { name, fullPath, file };
      })
    );

    if (dryRun) {
      console.log(`[DRY RUN] ${caseId} -> ${imageNames.join(", ")}`);
      success += 1;
      continue;
    }

    const uploadedImages = [];
    for (const [index, image] of imageFiles.entries()) {
      const extension = image.name.includes(".") ? image.name.split(".").pop() || "jpg" : "jpg";
      const cleanExtension = extension.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      const storagePath = `training/${caseId}/${Date.now()}-${index}.${cleanExtension}`;

      const { error: uploadError } = await supabase.storage
        .from(ESTIMATOR_BUCKET)
        .upload(storagePath, image.file, {
          contentType: "image/jpeg",
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Upload fejlede på linje ${line}: ${uploadError.message}`);
      }

      uploadedImages.push({
        path: storagePath,
        name: image.name,
        isEdge: image.name === edgeImage,
        isOverview: image.name === kitchenImage
      });
    }

    const retentionDeleteAt = new Date();
    retentionDeleteAt.setDate(retentionDeleteAt.getDate() + 3650);

    const { error: insertError } = await supabase.from("estimator_requests").insert({
      gating_answer: "ved_ikke",
      fields: {
        navn: "Træning",
        telefon: "00000000",
        laengdeCm: lengthCm,
        dybdeCm: depthCm,
        antal: count,
        extras: extras ?? undefined
      },
      images: uploadedImages,
      status: DEFAULT_STATUS,
      retention_delete_at: retentionDeleteAt.toISOString(),
      price_min: priceMin,
      price_max: priceMax,
      ai_price_min: null,
      ai_price_max: null,
      ai_status: "training"
    });

    if (insertError) {
      throw new Error(`Insert fejlede på linje ${line}: ${insertError.message}`);
    }

    success += 1;
    console.log(`Importeret: ${caseId}`);
  }

  console.log(`Færdig. Importeret: ${success} cases.`);
};

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
