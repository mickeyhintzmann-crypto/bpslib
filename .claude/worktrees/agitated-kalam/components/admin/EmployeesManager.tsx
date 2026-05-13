"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

type EmployeeItem = {
  id: string;
  createdAt: string;
  name: string;
  email: string | null;
  role: string;
  isActive: boolean;
  calendarColor: string | null;
};

type EmployeesResponse = {
  items?: EmployeeItem[];
  message?: string;
};

type RoleUserItem = {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
};

type RoleUsersResponse = {
  items?: RoleUserItem[];
  message?: string;
};

const emptyForm = {
  name: "",
  email: "",
  role: "worker",
  calendarColor: "#f97316",
  isActive: true
};

export const EmployeesManager = () => {
  const [items, setItems] = useState<EmployeeItem[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [credentialsBusyId, setCredentialsBusyId] = useState<string | null>(null);
  const [activationCodeMessage, setActivationCodeMessage] = useState("");
  const [roleUsers, setRoleUsers] = useState<RoleUserItem[]>([]);
  const [selectedRoleUserId, setSelectedRoleUserId] = useState("");

  const loadEmployees = async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (showAll) {
        params.set("all", "1");
      }

      const response = await fetch(`/api/admin/employees?${params.toString()}`, { cache: "no-store" });
      const payload = (await response.json()) as EmployeesResponse;

      if (!response.ok || !payload.items) {
        setItems([]);
        setError(payload.message || "Kunne ikke hente medarbejdere.");
        return;
      }

      setItems(payload.items);
    } catch (fetchError) {
      console.error(fetchError);
      setItems([]);
      setError("Netværksfejl ved hentning af medarbejdere.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAll]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setSelectedRoleUserId("");
    setSaveError("");
    setEditorOpen(true);
  };

  const openEdit = (item: EmployeeItem) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      email: item.email || "",
      role: item.role || "worker",
      calendarColor: item.calendarColor || "#f97316",
      isActive: item.isActive
    });
    setSelectedRoleUserId("");
    setSaveError("");
    setEditorOpen(true);
  };

  useEffect(() => {
    const loadRoleUsers = async () => {
      try {
        const response = await fetch("/api/admin/users?active=1&role=employee", { cache: "no-store" });
        const payload = (await response.json()) as RoleUsersResponse;
        if (!response.ok || !payload.items) {
          return;
        }
        setRoleUsers(payload.items);
      } catch (fetchError) {
        console.error(fetchError);
      }
    };

    loadRoleUsers();
  }, []);

  const applyRoleUser = (userId: string) => {
    setSelectedRoleUserId(userId);
    const selected = roleUsers.find((item) => item.id === userId);
    if (!selected) {
      return;
    }
    setForm((current) => ({
      ...current,
      name: selected.name || current.name,
      email: selected.email || current.email,
      role: "worker"
    }));
  };

  const saveEmployee = async () => {
    setSaving(true);
    setSaveError("");

    try {
      const endpoint = editingId ? `/api/admin/employees/${editingId}` : "/api/admin/employees";
      const method = editingId ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          role: form.role,
          calendar_color: form.calendarColor,
          is_active: form.isActive
        })
      });

      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        setSaveError(payload.message || "Kunne ikke gemme medarbejder.");
        return;
      }

      setEditorOpen(false);
      setEditingId(null);
      setForm(emptyForm);
      await loadEmployees();
    } catch (persistError) {
      console.error(persistError);
      setSaveError("Netværksfejl ved gemning.");
    } finally {
      setSaving(false);
    }
  };

  const deactivateEmployee = async (item: EmployeeItem) => {
    const confirmed = window.confirm(`Deaktivér ${item.name}?`);
    if (!confirmed) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/employees/${item.id}`, {
        method: "DELETE"
      });
      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        setError(payload.message || "Kunne ikke deaktivere medarbejder.");
        return;
      }
      await loadEmployees();
    } catch (deleteError) {
      console.error(deleteError);
      setError("Netværksfejl ved deaktivering.");
    } finally {
      setSaving(false);
    }
  };

  const generateCredentials = async (item: EmployeeItem) => {
    if (!item.email) {
      setError("Medarbejder skal have email før login-kode kan oprettes.");
      return;
    }
    setCredentialsBusyId(item.id);
    setError("");
    setActivationCodeMessage("");
    try {
      const response = await fetch(`/api/admin/employees/${item.id}/credentials`, { method: "POST" });
      const payload = (await response.json()) as { message?: string; activationCode?: string };
      if (!response.ok || !payload.activationCode) {
        setError(payload.message || "Kunne ikke oprette aktiveringskode.");
        return;
      }
      setActivationCodeMessage(`Aktiveringskode for ${item.name}: ${payload.activationCode}`);
    } catch (fetchError) {
      console.error(fetchError);
      setError("Netværksfejl ved oprettelse af aktiveringskode.");
    } finally {
      setCredentialsBusyId(null);
    }
  };

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">Employees</h1>
          <p className="text-sm text-muted-foreground">Grundlag for planlægning og job-allokering.</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" checked={showAll} onChange={(event) => setShowAll(event.target.checked)} />
            Vis inaktive
          </label>
          <Button variant="outline" onClick={() => loadEmployees()} disabled={loading}>
            {loading ? "Henter..." : "Opdater"}
          </Button>
          <Button onClick={openCreate}>Ny medarbejder</Button>
        </div>
      </div>

      {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
      {activationCodeMessage ? <p className="text-sm font-medium text-emerald-700">{activationCodeMessage}</p> : null}

      <div className="overflow-hidden rounded-2xl border border-border bg-white">
        <div className="grid grid-cols-[1.6fr_1.8fr_1fr_120px_120px] border-b border-border/70 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <span>Navn</span>
          <span>Email (login)</span>
          <span>Rolle</span>
          <span>Aktiv</span>
          <span>Handling</span>
        </div>

        <div className="divide-y divide-border/60">
          {items.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted-foreground">
              {loading ? "Henter medarbejdere..." : "Ingen medarbejdere endnu."}
            </p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="grid grid-cols-[1.6fr_1.8fr_1fr_120px_120px] items-center gap-2 px-4 py-3 text-sm">
                <div className="flex items-center gap-2 text-foreground">
                  <span
                    className="inline-block h-3 w-3 rounded-full border border-border"
                    style={{ backgroundColor: item.calendarColor || "#f97316" }}
                  />
                  <span>{item.name}</span>
                </div>
                <span className="text-muted-foreground">{item.email || "-"}</span>
                <span className="text-muted-foreground">{item.role || "worker"}</span>
                <span className={item.isActive ? "text-emerald-700" : "text-slate-500"}>
                  {item.isActive ? "Ja" : "Nej"}
                </span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(item)}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => generateCredentials(item)}
                    disabled={credentialsBusyId === item.id}
                  >
                    {credentialsBusyId === item.id ? "Opretter..." : "Login-kode"}
                  </Button>
                  {item.isActive ? (
                    <Button size="sm" variant="outline" onClick={() => deactivateEmployee(item)} disabled={saving}>
                      Deaktivér
                    </Button>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {editorOpen ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
          <div className="h-full w-full max-w-xl overflow-y-auto bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">
                  {editingId ? "Redigér medarbejder" : "Ny medarbejder"}
                </h2>
                <p className="text-sm text-muted-foreground">Opdater navn, rolle og kalenderfarve.</p>
              </div>
              <Button variant="outline" onClick={() => setEditorOpen(false)}>
                Luk
              </Button>
            </div>

            {saveError ? <p className="mt-4 text-sm font-medium text-red-700">{saveError}</p> : null}

            <div className="mt-5 space-y-4">
              {!editingId ? (
                <label className="block text-sm font-medium text-muted-foreground">
                  Vælg fra Brugere & roller (employee)
                  <select
                    value={selectedRoleUserId}
                    onChange={(event) => applyRoleUser(event.target.value)}
                    className="mt-2 h-10 w-full rounded-md border border-border bg-white px-3"
                  >
                    <option value="">Vælg bruger (valgfrit)</option>
                    {roleUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} · {user.email}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              <label className="block text-sm font-medium text-muted-foreground">
                Navn
                <input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  className="mt-2 h-10 w-full rounded-md border border-border bg-white px-3"
                />
              </label>

              <label className="block text-sm font-medium text-muted-foreground">
                Email (bruges til medarbejder-login)
                <input
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  className="mt-2 h-10 w-full rounded-md border border-border bg-white px-3"
                  placeholder="fx medarbejder@bpslib.dk"
                />
              </label>

              <label className="block text-sm font-medium text-muted-foreground">
                Rolle
                <select
                  value={form.role}
                  onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
                  className="mt-2 h-10 w-full rounded-md border border-border bg-white px-3"
                >
                  <option value="worker">worker</option>
                  <option value="leder">leder</option>
                  <option value="admin">admin</option>
                </select>
              </label>

              <label className="block text-sm font-medium text-muted-foreground">
                Kalenderfarve
                <input
                  type="color"
                  value={form.calendarColor}
                  onChange={(event) => setForm((current) => ({ ...current, calendarColor: event.target.value }))}
                  className="mt-2 h-10 w-28 rounded-md border border-border bg-white px-1"
                />
              </label>

              <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
                />
                Aktiv
              </label>
            </div>

            <div className="mt-6 flex gap-3">
              <Button onClick={saveEmployee} disabled={saving}>
                {saving ? "Gemmer..." : editingId ? "Gem ændringer" : "Opret medarbejder"}
              </Button>
              <Button variant="outline" onClick={() => setEditorOpen(false)}>
                Annuller
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};
