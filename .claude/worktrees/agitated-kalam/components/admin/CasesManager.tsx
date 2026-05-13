"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { slugify } from "@/lib/slugify";

const CATEGORY_OPTIONS = [
  { value: "bordplade", label: "Bordplade" },
  { value: "gulvafslibning", label: "Gulvafslibning" },
  { value: "gulvbelaegning", label: "Gulvbelægning" }
] as const;

const IMAGE_KIND_OPTIONS = [
  { value: "before", label: "Before" },
  { value: "after", label: "After" },
  { value: "wide", label: "Wide" },
  { value: "detail", label: "Detail" }
] as const;

type CaseCategory = (typeof CATEGORY_OPTIONS)[number]["value"];
type ImageKind = (typeof IMAGE_KIND_OPTIONS)[number]["value"];

type CaseItem = {
  id: string;
  title: string;
  slug: string;
  category: CaseCategory;
  location: string;
  summary: string;
  tags: string[];
  clientId: string | null;
  isFeatured: boolean;
  published: boolean;
  createdAt: string;
};

type ClientItem = {
  id: string;
  name: string;
};

type CaseImageItem = {
  id: string;
  caseId: string;
  kind: ImageKind;
  url: string;
  path: string;
  sortOrder: number;
  createdAt: string;
};

type UploadDraft = {
  id: string;
  file: File;
  kind: ImageKind;
  uploading: boolean;
  error: string;
};

type CasesListResponse = {
  items?: CaseItem[];
  clients?: ClientItem[];
  message?: string;
};

type CaseResponse = {
  item?: CaseItem;
  message?: string;
};

type ImagesResponse = {
  items?: CaseImageItem[];
  message?: string;
};

const inferKindFromFilename = (filename: string): ImageKind => {
  const lower = filename.toLowerCase();
  if (lower.includes("after") || lower.includes("efter")) {
    return "after";
  }
  if (lower.includes("before") || lower.includes("foer")) {
    return "before";
  }
  if (lower.includes("detail")) {
    return "detail";
  }
  return "wide";
};

const formatDate = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "Ukendt";
  }

  return new Intl.DateTimeFormat("da-DK", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(date);
};

const emptyForm = {
  title: "",
  slug: "",
  category: "bordplade" as CaseCategory,
  location: "",
  summary: "",
  tagsInput: "",
  clientId: "",
  isFeatured: false,
  published: true
};

export const CasesManager = () => {
  const [items, setItems] = useState<CaseItem[]>([]);
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("alle");
  const [publishedFilter, setPublishedFilter] = useState("alle");

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveBusy, setSaveBusy] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const [imagesOpen, setImagesOpen] = useState(false);
  const [activeCase, setActiveCase] = useState<CaseItem | null>(null);
  const [images, setImages] = useState<CaseImageItem[]>([]);
  const [imagesBusy, setImagesBusy] = useState(false);
  const [imagesError, setImagesError] = useState("");
  const [uploadDrafts, setUploadDrafts] = useState<UploadDraft[]>([]);

  const clientNameById = useMemo(() => {
    const map = new Map<string, string>();
    clients.forEach((client) => {
      map.set(client.id, client.name);
    });
    return map;
  }, [clients]);

  const loadCases = async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (query.trim()) {
        params.set("q", query.trim());
      }
      if (categoryFilter !== "alle") {
        params.set("category", categoryFilter);
      }
      if (publishedFilter !== "alle") {
        params.set("published", publishedFilter);
      }
      params.set("limit", "200");

      const response = await fetch(`/api/admin/cases-manager?${params.toString()}`, {
        cache: "no-store"
      });
      const payload = (await response.json()) as CasesListResponse;

      if (!response.ok || !payload.items) {
        setItems([]);
        setError(payload.message || "Kunne ikke hente cases.");
        return;
      }

      setItems(payload.items);
      setClients(payload.clients || []);
    } catch (fetchError) {
      console.error(fetchError);
      setItems([]);
      setError("Netværksfejl ved hentning af cases.");
    } finally {
      setLoading(false);
    }
  };

  const loadCase = async (id: string) => {
    const response = await fetch(`/api/admin/cases-manager/${id}`, { cache: "no-store" });
    const payload = (await response.json()) as CaseResponse;

    if (!response.ok || !payload.item) {
      throw new Error(payload.message || "Kunne ikke hente case.");
    }

    return payload.item;
  };

  const loadImages = async (caseId: string) => {
    setImagesBusy(true);
    setImagesError("");

    try {
      const response = await fetch(`/api/admin/cases-manager/images?caseId=${encodeURIComponent(caseId)}`, {
        cache: "no-store"
      });
      const payload = (await response.json()) as ImagesResponse;

      if (!response.ok || !payload.items) {
        setImages([]);
        setImagesError(payload.message || "Kunne ikke hente billeder.");
        return;
      }

      setImages(payload.items);
    } catch (loadError) {
      console.error(loadError);
      setImages([]);
      setImagesError("Netværksfejl ved hentning af billeder.");
    } finally {
      setImagesBusy(false);
    }
  };

  useEffect(() => {
    loadCases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetEditor = () => {
    setForm(emptyForm);
    setSaveError("");
    setSlugTouched(false);
    setEditingId(null);
  };

  const openCreate = () => {
    resetEditor();
    setEditorOpen(true);
  };

  const openEdit = async (itemId: string) => {
    setSaveError("");
    setSaveBusy(true);

    try {
      const item = await loadCase(itemId);
      setEditingId(item.id);
      setForm({
        title: item.title,
        slug: item.slug,
        category: item.category,
        location: item.location || "",
        summary: item.summary || "",
        tagsInput: item.tags.join(", "),
        clientId: item.clientId || "",
        isFeatured: item.isFeatured,
        published: item.published
      });
      setSlugTouched(true);
      setEditorOpen(true);
    } catch (openError) {
      console.error(openError);
      setError(openError instanceof Error ? openError.message : "Kunne ikke åbne case.");
    } finally {
      setSaveBusy(false);
    }
  };

  const updateCaseField = async (id: string, patch: Partial<CaseItem>) => {
    setError("");

    const previous = items;
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));

    try {
      const response = await fetch(`/api/admin/cases-manager/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          isFeatured: patch.isFeatured,
          published: patch.published
        })
      });

      const payload = (await response.json()) as CaseResponse;
      if (!response.ok || !payload.item) {
        setItems(previous);
        setError(payload.message || "Kunne ikke opdatere case.");
        return;
      }

      setItems((current) => current.map((item) => (item.id === id ? payload.item! : item)));
    } catch (toggleError) {
      console.error(toggleError);
      setItems(previous);
      setError("Netværksfejl ved opdatering.");
    }
  };

  const saveCase = async () => {
    setSaveBusy(true);
    setSaveError("");

    try {
      const payload = {
        title: form.title,
        slug: form.slug,
        category: form.category,
        location: form.location,
        summary: form.summary,
        tags: form.tagsInput,
        clientId: form.clientId,
        isFeatured: form.isFeatured,
        published: form.published
      };

      const isEdit = Boolean(editingId);
      const endpoint = isEdit ? `/api/admin/cases-manager/${editingId}` : "/api/admin/cases-manager";
      const method = isEdit ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = (await response.json()) as CaseResponse;
      if (!response.ok || !data.item) {
        setSaveError(data.message || "Kunne ikke gemme case.");
        return;
      }

      setEditorOpen(false);
      resetEditor();
      await loadCases();
    } catch (persistError) {
      console.error(persistError);
      setSaveError("Netværksfejl ved gemning.");
    } finally {
      setSaveBusy(false);
    }
  };

  const deleteCase = async (item: CaseItem) => {
    const confirmed = window.confirm(`Slet casen \"${item.title}\"?`);
    if (!confirmed) {
      return;
    }

    setSaveBusy(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/cases-manager/${item.id}`, {
        method: "DELETE"
      });
      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        setError(payload.message || "Kunne ikke slette case.");
        return;
      }

      if (activeCase?.id === item.id) {
        setImagesOpen(false);
        setActiveCase(null);
        setImages([]);
      }

      await loadCases();
    } catch (deleteError) {
      console.error(deleteError);
      setError("Netværksfejl ved sletning.");
    } finally {
      setSaveBusy(false);
    }
  };

  const openImages = async (item: CaseItem) => {
    setActiveCase(item);
    setUploadDrafts([]);
    setImagesOpen(true);
    await loadImages(item.id);
  };

  const onFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }

    const nextDrafts = Array.from(files).map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
      file,
      kind: inferKindFromFilename(file.name),
      uploading: false,
      error: ""
    }));

    setUploadDrafts((current) => [...current, ...nextDrafts]);
  };

  const updateDraftKind = (draftId: string, kind: ImageKind) => {
    setUploadDrafts((current) => current.map((draft) => (draft.id === draftId ? { ...draft, kind } : draft)));
  };

  const removeDraft = (draftId: string) => {
    setUploadDrafts((current) => current.filter((draft) => draft.id !== draftId));
  };

  const uploadDraft = async (draftId: string) => {
    if (!activeCase) {
      return;
    }

    const draft = uploadDrafts.find((item) => item.id === draftId);
    if (!draft) {
      return;
    }

    setUploadDrafts((current) =>
      current.map((item) => (item.id === draftId ? { ...item, uploading: true, error: "" } : item))
    );

    try {
      const formData = new FormData();
      formData.append("file", draft.file);
      formData.append("caseId", activeCase.id);
      formData.append("kind", draft.kind);

      const response = await fetch("/api/admin/cases-manager/images", {
        method: "POST",
        body: formData
      });

      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        setUploadDrafts((current) =>
          current.map((item) =>
            item.id === draftId
              ? { ...item, uploading: false, error: payload.message || "Upload fejlede." }
              : item
          )
        );
        return;
      }

      setUploadDrafts((current) => current.filter((item) => item.id !== draftId));
      await loadImages(activeCase.id);
    } catch (uploadError) {
      console.error(uploadError);
      setUploadDrafts((current) =>
        current.map((item) =>
          item.id === draftId ? { ...item, uploading: false, error: "Netværksfejl ved upload." } : item
        )
      );
    }
  };

  const uploadAllDrafts = async () => {
    for (const draft of uploadDrafts) {
      // sequential upload keeps order predictable and easier to debug in admin
      // eslint-disable-next-line no-await-in-loop
      await uploadDraft(draft.id);
    }
  };

  const deleteImage = async (image: CaseImageItem) => {
    const confirmed = window.confirm("Slet billede?");
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/cases-manager/images/${image.id}`, {
        method: "DELETE"
      });
      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        setImagesError(payload.message || "Kunne ikke slette billede.");
        return;
      }

      setImages((current) => current.filter((item) => item.id !== image.id));
    } catch (deleteError) {
      console.error(deleteError);
      setImagesError("Netværksfejl ved sletning af billede.");
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">Cases Manager</h1>
          <p className="text-sm text-muted-foreground">CRUD, publicering og billedhåndtering for cases.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => loadCases()} disabled={loading}>
            {loading ? "Henter..." : "Opdater"}
          </Button>
          <Button onClick={openCreate}>Ny case</Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Søg titel, slug eller lokation"
          className="h-10 rounded-md border border-border bg-white px-3 text-sm"
        />
        <select
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          className="h-10 rounded-md border border-border bg-white px-3 text-sm"
        >
          <option value="alle">Alle kategorier</option>
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          value={publishedFilter}
          onChange={(event) => setPublishedFilter(event.target.value)}
          className="h-10 rounded-md border border-border bg-white px-3 text-sm"
        >
          <option value="alle">Alle publiceringsstatus</option>
          <option value="true">Kun published</option>
          <option value="false">Kun skjulte</option>
        </select>
        <Button variant="outline" onClick={() => loadCases()}>
          Søg
        </Button>
      </div>

      {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}

      <div className="overflow-hidden rounded-2xl border border-border bg-white">
        <div className="grid grid-cols-[1.8fr_1fr_1.2fr_0.8fr_0.8fr_1.4fr] gap-3 bg-muted/60 px-4 py-3 text-xs font-semibold uppercase text-muted-foreground">
          <span>Titel</span>
          <span>Kategori</span>
          <span>Lokation</span>
          <span>Featured</span>
          <span>Published</span>
          <span>Handlinger</span>
        </div>
        <div className="divide-y divide-border/70">
          {items.length === 0 ? (
            <div className="px-4 py-6 text-sm text-muted-foreground">
              {loading ? "Henter cases..." : "Ingen cases fundet."}
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[1.8fr_1fr_1.2fr_0.8fr_0.8fr_1.4fr] items-center gap-3 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    /{item.slug} · {formatDate(item.createdAt)}
                  </p>
                  {item.clientId ? (
                    <p className="text-xs text-muted-foreground">Kunde: {clientNameById.get(item.clientId) || "Ukendt"}</p>
                  ) : null}
                </div>
                <span>{CATEGORY_OPTIONS.find((entry) => entry.value === item.category)?.label || item.category}</span>
                <span>{item.location || "-"}</span>
                <label className="inline-flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={item.isFeatured}
                    onChange={(event) => updateCaseField(item.id, { isFeatured: event.target.checked })}
                  />
                  {item.isFeatured ? "Ja" : "Nej"}
                </label>
                <label className="inline-flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={item.published}
                    onChange={(event) => updateCaseField(item.id, { published: event.target.checked })}
                  />
                  {item.published ? "Ja" : "Nej"}
                </label>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(item.id)} disabled={saveBusy}>
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => openImages(item)}>
                    Images
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => deleteCase(item)} disabled={saveBusy}>
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {editorOpen ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
          <div className="h-full w-full max-w-2xl overflow-y-auto bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">
                  {editingId ? "Redigér case" : "Opret case"}
                </h2>
                <p className="text-sm text-muted-foreground">Udfyld felterne og gem.</p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setEditorOpen(false);
                  resetEditor();
                }}
              >
                Luk
              </Button>
            </div>

            {saveError ? <p className="mt-4 text-sm font-medium text-red-700">{saveError}</p> : null}

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium text-muted-foreground md:col-span-2">
                Titel
                <input
                  value={form.title}
                  onChange={(event) => {
                    const nextTitle = event.target.value;
                    setForm((current) => ({
                      ...current,
                      title: nextTitle,
                      slug: slugTouched ? current.slug : slugify(nextTitle)
                    }));
                  }}
                  className="mt-2 h-10 w-full rounded-md border border-border bg-white px-3"
                />
              </label>

              <label className="text-sm font-medium text-muted-foreground md:col-span-2">
                Slug
                <input
                  value={form.slug}
                  onChange={(event) => {
                    setSlugTouched(true);
                    setForm((current) => ({ ...current, slug: slugify(event.target.value) }));
                  }}
                  placeholder="auto-genereres hvis tom"
                  className="mt-2 h-10 w-full rounded-md border border-border bg-white px-3"
                />
              </label>

              <label className="text-sm font-medium text-muted-foreground">
                Kategori
                <select
                  value={form.category}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, category: event.target.value as CaseCategory }))
                  }
                  className="mt-2 h-10 w-full rounded-md border border-border bg-white px-3"
                >
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-medium text-muted-foreground">
                Lokation
                <input
                  value={form.location}
                  onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
                  className="mt-2 h-10 w-full rounded-md border border-border bg-white px-3"
                />
              </label>

              <label className="text-sm font-medium text-muted-foreground md:col-span-2">
                Summary
                <textarea
                  value={form.summary}
                  onChange={(event) => setForm((current) => ({ ...current, summary: event.target.value }))}
                  rows={4}
                  className="mt-2 w-full rounded-md border border-border bg-white px-3 py-2"
                />
              </label>

              <label className="text-sm font-medium text-muted-foreground md:col-span-2">
                Tags (comma separated)
                <input
                  value={form.tagsInput}
                  onChange={(event) => setForm((current) => ({ ...current, tagsInput: event.target.value }))}
                  placeholder="fx eg, olie, køkken"
                  className="mt-2 h-10 w-full rounded-md border border-border bg-white px-3"
                />
              </label>

              <label className="text-sm font-medium text-muted-foreground md:col-span-2">
                Kunde (valgfri)
                <select
                  value={form.clientId}
                  onChange={(event) => setForm((current) => ({ ...current, clientId: event.target.value }))}
                  className="mt-2 h-10 w-full rounded-md border border-border bg-white px-3"
                >
                  <option value="">Ingen kunde</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(event) => setForm((current) => ({ ...current, isFeatured: event.target.checked }))}
                />
                Featured
              </label>

              <label className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(event) => setForm((current) => ({ ...current, published: event.target.checked }))}
                />
                Published
              </label>
            </div>

            <div className="mt-6 flex gap-3">
              <Button onClick={saveCase} disabled={saveBusy}>
                {saveBusy ? "Gemmer..." : editingId ? "Gem ændringer" : "Opret case"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setEditorOpen(false);
                  resetEditor();
                }}
              >
                Annuller
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {imagesOpen && activeCase ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
          <div className="h-full w-full max-w-3xl overflow-y-auto bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Billeder · {activeCase.title}</h2>
                <p className="text-sm text-muted-foreground">Upload, kategorisér og slet case-billeder.</p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setImagesOpen(false);
                  setActiveCase(null);
                  setImages([]);
                  setUploadDrafts([]);
                }}
              >
                Luk
              </Button>
            </div>

            {imagesError ? <p className="mt-4 text-sm font-medium text-red-700">{imagesError}</p> : null}

            <div className="mt-5 rounded-xl border border-border bg-muted/30 p-4">
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(event) => {
                    onFilesSelected(event.target.files);
                    event.currentTarget.value = "";
                  }}
                  className="block text-sm text-muted-foreground"
                />
                <Button variant="outline" onClick={uploadAllDrafts} disabled={uploadDrafts.length === 0}>
                  Upload alle
                </Button>
              </div>

              {uploadDrafts.length > 0 ? (
                <div className="mt-4 space-y-2">
                  {uploadDrafts.map((draft) => (
                    <div key={draft.id} className="grid items-center gap-2 rounded-lg border border-border bg-white p-2 md:grid-cols-[1fr_160px_auto_auto]">
                      <span className="truncate text-sm text-foreground">{draft.file.name}</span>
                      <select
                        value={draft.kind}
                        onChange={(event) => updateDraftKind(draft.id, event.target.value as ImageKind)}
                        className="h-9 rounded-md border border-border bg-white px-2 text-sm"
                        disabled={draft.uploading}
                      >
                        {IMAGE_KIND_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <Button size="sm" variant="outline" onClick={() => uploadDraft(draft.id)} disabled={draft.uploading}>
                        {draft.uploading ? "Uploader..." : "Upload"}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => removeDraft(draft.id)} disabled={draft.uploading}>
                        Fjern
                      </Button>
                      {draft.error ? <p className="text-xs text-red-700 md:col-span-4">{draft.error}</p> : null}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Eksisterende billeder</h3>
                <Button variant="outline" size="sm" onClick={() => loadImages(activeCase.id)} disabled={imagesBusy}>
                  {imagesBusy ? "Henter..." : "Opdater"}
                </Button>
              </div>

              {images.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {imagesBusy ? "Henter billeder..." : "Ingen billeder endnu."}
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {images.map((image) => (
                    <article key={image.id} className="overflow-hidden rounded-xl border border-border bg-white">
                      <div className="aspect-[4/3] bg-muted/30">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={image.url} alt={image.kind} className="h-full w-full object-cover" />
                      </div>
                      <div className="space-y-1 p-3 text-xs text-muted-foreground">
                        <p>
                          <strong className="text-foreground">Kind:</strong> {image.kind}
                        </p>
                        <p>
                          <strong className="text-foreground">Sort:</strong> {image.sortOrder}
                        </p>
                        <Button size="sm" variant="outline" onClick={() => deleteImage(image)}>
                          Slet billede
                        </Button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};
