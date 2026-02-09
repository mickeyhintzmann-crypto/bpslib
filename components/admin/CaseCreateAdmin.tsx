"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { BpsImage } from "@/components/BpsImage";
import { Button } from "@/components/ui/button";

const CATEGORY_VALUES = ["bordplade", "gulv", "andet"] as const;
const FINISH_VALUES = ["olie", "lak", "saebe", "andet"] as const;
const STATUS_VALUES = ["published", "draft"] as const;

type CreateResponse = {
  item?: { id: string };
  message?: string;
};

type UploadResponse = {
  url?: string;
  message?: string;
};

export const CaseCreateAdmin = () => {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [uploadingBefore, setUploadingBefore] = useState(false);
  const [uploadingAfter, setUploadingAfter] = useState(false);
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);

  const [category, setCategory] = useState("bordplade");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [finish, setFinish] = useState("andet");
  const [problem, setProblem] = useState("");
  const [beforeImage, setBeforeImage] = useState("");
  const [afterImage, setAfterImage] = useState("");
  const [beforeAlt, setBeforeAlt] = useState("");
  const [afterAlt, setAfterAlt] = useState("");
  const [status, setStatus] = useState("published");

  const uploadFile = async (file: File, kind: "before" | "after") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("kind", kind);

    const response = await fetch("/api/admin/cases/upload", {
      method: "POST",
      body: formData
    });

    const payload = (await response.json()) as UploadResponse;
    if (!response.ok || !payload.url) {
      throw new Error(payload.message || "Kunne ikke uploade billede.");
    }

    return payload.url;
  };

  const handleUpload = async (kind: "before" | "after") => {
    setUploadError("");
    const file = kind === "before" ? beforeFile : afterFile;
    if (!file) {
      setUploadError("Vælg en billedfil før upload.");
      return;
    }

    try {
      if (kind === "before") {
        setUploadingBefore(true);
      } else {
        setUploadingAfter(true);
      }
      const url = await uploadFile(file, kind);
      if (kind === "before") {
        setBeforeImage(url);
      } else {
        setAfterImage(url);
      }
    } catch (uploadError) {
      console.error(uploadError);
      setUploadError(uploadError instanceof Error ? uploadError.message : "Upload fejlede.");
    } finally {
      setUploadingBefore(false);
      setUploadingAfter(false);
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/admin/cases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          category,
          title,
          location,
          finish,
          problem,
          beforeImage,
          afterImage,
          beforeAlt,
          afterAlt,
          status
        })
      });

      const payload = (await response.json()) as CreateResponse;
      if (!response.ok || !payload.item) {
        setError(payload.message || "Kunne ikke oprette case.");
        return;
      }

      router.push(`/admin/cases/${payload.item.id}`);
    } catch (createError) {
      console.error(createError);
      setError("Netværksfejl ved oprettelse.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-6 rounded-2xl border border-border/70 bg-white/70 p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">Ny case</h1>
          <p className="text-sm text-muted-foreground">
            Upload billeder direkte her, eller indsæt en eksisterende URL.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/cases">Tilbage til cases</Link>
        </Button>
      </div>

      {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
      {uploadError ? <p className="text-sm font-medium text-red-700">{uploadError}</p> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium text-muted-foreground">
          Titel
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="mt-2 h-10 w-full rounded-md border border-border bg-white px-3"
          />
        </label>
        <label className="text-sm font-medium text-muted-foreground">
          Lokation
          <input
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            className="mt-2 h-10 w-full rounded-md border border-border bg-white px-3"
          />
        </label>
        <label className="text-sm font-medium text-muted-foreground">
          Kategori
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="mt-2 h-10 w-full rounded-md border border-border bg-white px-3"
          >
            {CATEGORY_VALUES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-muted-foreground">
          Finish
          <select
            value={finish}
            onChange={(event) => setFinish(event.target.value)}
            className="mt-2 h-10 w-full rounded-md border border-border bg-white px-3"
          >
            {FINISH_VALUES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-muted-foreground md:col-span-2">
          Problem
          <input
            value={problem}
            onChange={(event) => setProblem(event.target.value)}
            className="mt-2 h-10 w-full rounded-md border border-border bg-white px-3"
          />
        </label>
        <label className="text-sm font-medium text-muted-foreground">
          Billede (før/eksempel)
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) => setBeforeFile(event.target.files?.[0] ?? null)}
            className="mt-2 block w-full text-xs text-muted-foreground"
          />
          <div className="mt-2 flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => handleUpload("before")}
              disabled={uploadingBefore || !beforeFile}
            >
              {uploadingBefore ? "Uploader..." : "Upload billede"}
            </Button>
            <input
              value={beforeImage}
              onChange={(event) => setBeforeImage(event.target.value)}
              placeholder="Eller indsæt URL"
              className="h-9 flex-1 rounded-md border border-border bg-white px-3 text-xs"
            />
          </div>
          {beforeImage ? (
            <div className="mt-3 overflow-hidden rounded-xl border border-border/70">
              <BpsImage src={beforeImage} alt="Forhåndsvisning før" width={900} height={600} />
            </div>
          ) : null}
        </label>
        <label className="text-sm font-medium text-muted-foreground">
          Billede (efter, valgfri)
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) => setAfterFile(event.target.files?.[0] ?? null)}
            className="mt-2 block w-full text-xs text-muted-foreground"
          />
          <div className="mt-2 flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => handleUpload("after")}
              disabled={uploadingAfter || !afterFile}
            >
              {uploadingAfter ? "Uploader..." : "Upload billede"}
            </Button>
            <input
              value={afterImage}
              onChange={(event) => setAfterImage(event.target.value)}
              placeholder="Eller indsæt URL"
              className="h-9 flex-1 rounded-md border border-border bg-white px-3 text-xs"
            />
          </div>
          {afterImage ? (
            <div className="mt-3 overflow-hidden rounded-xl border border-border/70">
              <BpsImage src={afterImage} alt="Forhåndsvisning efter" width={900} height={600} />
            </div>
          ) : null}
        </label>
        <label className="text-sm font-medium text-muted-foreground">
          Alt-tekst (før)
          <input
            value={beforeAlt}
            onChange={(event) => setBeforeAlt(event.target.value)}
            className="mt-2 h-10 w-full rounded-md border border-border bg-white px-3"
          />
        </label>
        <label className="text-sm font-medium text-muted-foreground">
          Alt-tekst (efter)
          <input
            value={afterAlt}
            onChange={(event) => setAfterAlt(event.target.value)}
            className="mt-2 h-10 w-full rounded-md border border-border bg-white px-3"
          />
        </label>
        <label className="text-sm font-medium text-muted-foreground">
          Status
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="mt-2 h-10 w-full rounded-md border border-border bg-white px-3"
          >
            {STATUS_VALUES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex gap-3">
        <Button onClick={handleSubmit} disabled={saving}>
          {saving ? "Opretter..." : "Opret case"}
        </Button>
      </div>
    </section>
  );
};
