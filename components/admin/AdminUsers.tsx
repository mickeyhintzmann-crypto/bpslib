"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

type AdminUser = {
  id: string;
  created_at: string;
  email: string;
  name: string;
  role: "owner" | "admin" | "employee" | "viewer";
  is_active: boolean;
};

type UsersResponse = {
  items?: AdminUser[];
  item?: AdminUser;
  message?: string;
};

const ROLE_OPTIONS: Array<AdminUser["role"]> = ["owner", "admin", "employee", "viewer"];

export const AdminUsers = () => {
  const [items, setItems] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<AdminUser["role"]>("employee");
  const [newActive, setNewActive] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editEmail, setEditEmail] = useState("");
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState<AdminUser["role"]>("employee");
  const [editActive, setEditActive] = useState(true);

  const loadUsers = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/admin/users", { cache: "no-store" });
      const payload = (await response.json()) as UsersResponse;
      if (!response.ok) {
        setError(payload.message || "Kunne ikke hente medarbejdere.");
        return;
      }
      setItems(payload.items || []);
    } catch (fetchError) {
      console.error(fetchError);
      setError("Netværksfejl ved hentning af medarbejdere.");
    } finally {
      setLoading(false);
    }
  };

  const resetCreateForm = () => {
    setNewEmail("");
    setNewName("");
    setNewRole("employee");
    setNewActive(true);
  };

  const handleCreate = async () => {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newEmail.trim(),
          name: newName.trim(),
          role: newRole,
          is_active: newActive
        })
      });
      const payload = (await response.json()) as UsersResponse;
      if (!response.ok || !payload.item) {
        setError(payload.message || "Kunne ikke oprette bruger.");
        return;
      }
      setItems((prev) => [...prev, payload.item!]);
      resetCreateForm();
      setMessage("Bruger oprettet.");
    } catch (createError) {
      console.error(createError);
      setError("Netværksfejl ved oprettelse.");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (user: AdminUser) => {
    setEditingId(user.id);
    setEditEmail(user.email);
    setEditName(user.name);
    setEditRole(user.role);
    setEditActive(user.is_active);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleUpdate = async () => {
    if (!editingId) {
      return;
    }
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch(`/api/admin/users/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: editEmail.trim(),
          name: editName.trim(),
          role: editRole,
          is_active: editActive
        })
      });
      const payload = (await response.json()) as UsersResponse;
      if (!response.ok || !payload.item) {
        setError(payload.message || "Kunne ikke opdatere bruger.");
        return;
      }
      setItems((prev) => prev.map((item) => (item.id === payload.item!.id ? payload.item! : item)));
      setEditingId(null);
      setMessage("Bruger opdateret.");
    } catch (updateError) {
      console.error(updateError);
      setError("Netværksfejl ved opdatering.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (userId: string) => {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE"
      });
      const payload = (await response.json()) as UsersResponse;
      if (!response.ok || !payload.item) {
        setError(payload.message || "Kunne ikke deaktivere bruger.");
        return;
      }
      setItems((prev) => prev.map((item) => (item.id === payload.item!.id ? payload.item! : item)));
      setMessage("Bruger deaktiveret.");
    } catch (deleteError) {
      console.error(deleteError);
      setError("Netværksfejl ved deaktivering.");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <section className="space-y-6 rounded-2xl border border-border/70 bg-white/70 p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">Medarbejdere</h1>
          <p className="text-sm text-muted-foreground">Opret og vedligehold admin-brugere.</p>
        </div>
        <Button variant="outline" onClick={loadUsers} disabled={loading}>
          {loading ? "Henter..." : "Genindlæs"}
        </Button>
      </div>

      {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
      {message ? <p className="text-sm font-medium text-emerald-700">{message}</p> : null}

      <div className="rounded-xl border border-border bg-white/80 p-4">
        <h2 className="text-lg font-semibold text-foreground">Opret bruger</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <input
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            placeholder="Navn"
            className="w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
          <input
            value={newEmail}
            onChange={(event) => setNewEmail(event.target.value)}
            placeholder="Email"
            className="w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
          <select
            value={newRole}
            onChange={(event) => setNewRole(event.target.value as AdminUser["role"])}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm"
          >
            {ROLE_OPTIONS.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={newActive}
              onChange={(event) => setNewActive(event.target.checked)}
            />
            Aktiv
          </label>
        </div>
        <div className="mt-4 flex gap-2">
          <Button onClick={handleCreate} disabled={saving}>
            {saving ? "Gemmer..." : "Opret bruger"}
          </Button>
          <Button variant="outline" onClick={resetCreateForm} disabled={saving}>
            Nulstil
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-white/80 p-4">
        <h2 className="text-lg font-semibold text-foreground">Brugeroversigt</h2>
        <div className="mt-4 space-y-3 text-sm">
          {items.length === 0 ? (
            <p className="text-muted-foreground">Ingen brugere fundet.</p>
          ) : (
            items.map((user) => {
              const isEditing = editingId === user.id;
              return (
                <div
                  key={user.id}
                  className="rounded-lg border border-border/70 bg-white px-4 py-3"
                >
                  <div className="grid gap-3 md:grid-cols-5 md:items-center">
                    <div>
                      <p className="font-semibold text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <p className="text-xs uppercase text-muted-foreground">{user.role}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.is_active ? "Aktiv" : "Inaktiv"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Oprettet {new Date(user.created_at).toLocaleDateString("da-DK")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => startEdit(user)}>
                        Redigér
                      </Button>
                      {user.is_active ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeactivate(user.id)}
                        >
                          Deaktivér
                        </Button>
                      ) : null}
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="mt-4 grid gap-3 rounded-lg border border-border/60 bg-background/80 p-3 md:grid-cols-4">
                      <input
                        value={editName}
                        onChange={(event) => setEditName(event.target.value)}
                        className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                        placeholder="Navn"
                      />
                      <input
                        value={editEmail}
                        onChange={(event) => setEditEmail(event.target.value)}
                        className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                        placeholder="Email"
                      />
                      <select
                        value={editRole}
                        onChange={(event) => setEditRole(event.target.value as AdminUser["role"])}
                        className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                      >
                        {ROLE_OPTIONS.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                      <label className="flex items-center gap-2 text-sm text-foreground">
                        <input
                          type="checkbox"
                          checked={editActive}
                          onChange={(event) => setEditActive(event.target.checked)}
                        />
                        Aktiv
                      </label>
                      <div className="flex gap-2 md:col-span-4">
                        <Button onClick={handleUpdate} disabled={saving}>
                          Gem ændringer
                        </Button>
                        <Button variant="outline" onClick={cancelEdit} disabled={saving}>
                          Annuller
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};
