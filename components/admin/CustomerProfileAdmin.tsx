"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  Calendar,
  MessageSquare,
  Camera,
  Clock,
  ArrowRight,
  Edit2,
  User,
  Tag
} from "lucide-react";

import { Button } from "@/components/ui/button";

type Customer = {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  postalCode: string | null;
  address: string | null;
  city: string | null;
  tags: string[];
  notes: string | null;
  source: string | null;
};

type Lead = {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  source: string;
};

type EstimatorRequest = {
  id: string;
  createdAt: string;
  updatedAt: string;
  service: string;
  status: string | null;
};

type Booking = {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: string | null;
  date: string | null;
  customerName: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
};

type TimelineEvent = {
  id: string;
  timestamp: string;
  type: "lead" | "estimator" | "booking";
  title: string;
  subtitle?: string;
  status?: string;
};

type CustomerResponse = {
  customer?: Customer;
  leads?: Lead[];
  estimatorRequests?: EstimatorRequest[];
  bookings?: Booking[];
  message?: string;
};

const formatDateTime = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "Ukendt";
  }
  return new Intl.DateTimeFormat("da-DK", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(date);
};

const formatDate = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "Ukendt";
  }
  return new Intl.DateTimeFormat("da-DK", {
    dateStyle: "short"
  }).format(date);
};

const getStatusColor = (status: string): string => {
  switch (status?.toLowerCase()) {
    case "confirmed":
    case "won":
    case "done":
      return "bg-green-100 text-green-800";
    case "pending_confirmation":
    case "new":
    case "contacted":
      return "bg-blue-100 text-blue-800";
    case "in_progress":
      return "bg-amber-100 text-amber-800";
    case "cancelled":
    case "lost":
    case "closed":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusLabel = (status: string | null): string => {
  if (!status) return "Ukendt";
  const labels: Record<string, string> = {
    new: "Ny",
    contacted: "Kontaktet",
    quote_sent: "Tilbud sendt",
    won: "Vundet",
    lost: "Tabt",
    closed: "Lukket",
    pending_confirmation: "Afventer bekræftelse",
    confirmed: "Bekræftet",
    in_progress: "I gang",
    done: "Afsluttet",
    cancelled: "Annulleret"
  };
  return labels[status] || status;
};

export const CustomerProfileAdmin = ({ customerId }: { customerId: string }) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [estimatorRequests, setEstimatorRequests] = useState<EstimatorRequest[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<Customer>>({});

  useEffect(() => {
    loadCustomer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  const loadCustomer = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/customers/${customerId}`, {
        cache: "no-store"
      });

      const payload = (await response.json()) as CustomerResponse;
      if (!response.ok || !payload.customer) {
        setCustomer(null);
        setError(payload.message || "Kunne ikke hente kundeinfo.");
        return;
      }

      setCustomer(payload.customer);
      setLeads(payload.leads || []);
      setEstimatorRequests(payload.estimatorRequests || []);
      setBookings(payload.bookings || []);

      // Build timeline
      const events: TimelineEvent[] = [];

      (payload.leads || []).forEach((lead) => {
        events.push({
          id: `lead-${lead.id}`,
          timestamp: lead.createdAt,
          type: "lead",
          title: "Lead",
          subtitle: lead.source,
          status: lead.status
        });
      });

      (payload.estimatorRequests || []).forEach((req) => {
        events.push({
          id: `estimator-${req.id}`,
          timestamp: req.createdAt,
          type: "estimator",
          title: "Estimat anmodning",
          subtitle: req.service,
          status: req.status || undefined
        });
      });

      (payload.bookings || []).forEach((booking) => {
        events.push({
          id: `booking-${booking.id}`,
          timestamp: booking.createdAt,
          type: "booking",
          title: "Booking",
          subtitle: booking.date ? formatDate(booking.date) : undefined,
          status: booking.status || undefined
        });
      });

      events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setTimeline(events);

      // Initialize edit data
      setEditData({
        name: payload.customer.name || "",
        email: payload.customer.email || "",
        phone: payload.customer.phone || "",
        address: payload.customer.address || "",
        postalCode: payload.customer.postalCode || "",
        city: payload.customer.city || "",
        tags: payload.customer.tags || [],
        notes: payload.customer.notes || ""
      });
    } catch (fetchError) {
      console.error(fetchError);
      setCustomer(null);
      setError("Netværksfejl ved hentning af kundeinfo.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/admin/customers/${customerId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: editData.name || null,
          email: editData.email || null,
          phone: editData.phone || null,
          postal_code: editData.postalCode || null,
          address: editData.address || null,
          city: editData.city || null,
          tags: editData.tags && editData.tags.length > 0 ? editData.tags : null,
          notes: editData.notes || null
        })
      });

      if (!response.ok) {
        setError("Kunne ikke gemme ændringer.");
        return;
      }

      await loadCustomer();
      setEditMode(false);
    } catch (saveError) {
      console.error(saveError);
      setError("Netværksfejl ved gemning.");
    }
  };

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="text-center text-muted-foreground">Henter kundeinfo...</div>
      </main>
    );
  }

  if (error || !customer) {
    return (
      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        <section className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <p className="text-red-700">{error || "Kunde blev ikke fundet."}</p>
          <Button onClick={() => loadCustomer()} className="mt-4">
            Prøv igen
          </Button>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-semibold text-foreground">{customer.name || "Ukendt kunde"}</h1>
            <p className="text-sm text-muted-foreground">Kunde-ID: {customerId}</p>
          </div>
          <Button
            onClick={() => {
              if (editMode) {
                handleSave();
              } else {
                setEditMode(true);
              }
            }}
            variant="default"
            className="gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
          >
            <Edit2 className="h-4 w-4" />
            {editMode ? "Gem" : "Rediger"}
          </Button>
        </div>

        {/* Kundekort */}
        <section className="rounded-2xl border border-border/70 bg-white/70 p-6 md:p-8">
          <h2 className="mb-6 text-xl font-semibold text-foreground">Kundekort</h2>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Name */}
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <User className="h-4 w-4" />
                Navn
              </label>
              {editMode ? (
                <input
                  type="text"
                  value={editData.name || ""}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="rounded-lg border border-input bg-white px-3 py-2 text-sm"
                />
              ) : (
                <p className="text-foreground font-medium">{customer.name || "-"}</p>
              )}
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Phone className="h-4 w-4" />
                Telefon
              </label>
              {editMode ? (
                <input
                  type="tel"
                  value={editData.phone || ""}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  className="rounded-lg border border-input bg-white px-3 py-2 text-sm"
                />
              ) : (
                <p className="text-foreground font-medium">
                  {customer.phone ? (
                    <a href={`tel:${customer.phone}`} className="text-orange-600 hover:underline">
                      {customer.phone}
                    </a>
                  ) : (
                    "-"
                  )}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Mail className="h-4 w-4" />
                Email
              </label>
              {editMode ? (
                <input
                  type="email"
                  value={editData.email || ""}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  className="rounded-lg border border-input bg-white px-3 py-2 text-sm"
                />
              ) : (
                <p className="text-foreground font-medium">
                  {customer.email ? (
                    <a href={`mailto:${customer.email}`} className="text-orange-600 hover:underline">
                      {customer.email}
                    </a>
                  ) : (
                    "-"
                  )}
                </p>
              )}
            </div>

            {/* Address */}
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <MapPin className="h-4 w-4" />
                Adresse
              </label>
              {editMode ? (
                <input
                  type="text"
                  value={editData.address || ""}
                  onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                  className="rounded-lg border border-input bg-white px-3 py-2 text-sm"
                />
              ) : (
                <p className="text-foreground font-medium">{customer.address || "-"}</p>
              )}
            </div>

            {/* Postal Code */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-muted-foreground">Postnummer</label>
              {editMode ? (
                <input
                  type="text"
                  value={editData.postalCode || ""}
                  onChange={(e) => setEditData({ ...editData, postalCode: e.target.value })}
                  className="rounded-lg border border-input bg-white px-3 py-2 text-sm"
                />
              ) : (
                <p className="text-foreground font-medium">{customer.postalCode || "-"}</p>
              )}
            </div>

            {/* City */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-muted-foreground">By</label>
              {editMode ? (
                <input
                  type="text"
                  value={editData.city || ""}
                  onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                  className="rounded-lg border border-input bg-white px-3 py-2 text-sm"
                />
              ) : (
                <p className="text-foreground font-medium">{customer.city || "-"}</p>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="mt-6 flex flex-col gap-3">
            <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Tag className="h-4 w-4" />
              Tags
            </label>
            {editMode ? (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {(editData.tags || []).map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-sm text-orange-700"
                    >
                      {tag}
                      <button
                        onClick={() =>
                          setEditData({
                            ...editData,
                            tags: (editData.tags || []).filter((_, i) => i !== idx)
                          })
                        }
                        className="ml-1 text-orange-600 hover:text-orange-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Tilføj tag og tryk Enter"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.currentTarget.value.trim()) {
                      setEditData({
                        ...editData,
                        tags: [...(editData.tags || []), e.currentTarget.value.trim()]
                      });
                      e.currentTarget.value = "";
                    }
                  }}
                  className="rounded-lg border border-input bg-white px-3 py-2 text-sm"
                />
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {customer.tags.length > 0 ? (
                  customer.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-sm text-orange-700"
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <p className="text-muted-foreground">-</p>
                )}
              </div>
            )}
          </div>

          {/* Internal Notes */}
          <div className="mt-6 flex flex-col gap-3">
            <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              Interne noter
            </label>
            {editMode ? (
              <textarea
                value={editData.notes || ""}
                onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                rows={4}
                className="rounded-lg border border-input bg-white px-3 py-2 text-sm"
              />
            ) : (
              <p className="whitespace-pre-wrap text-foreground">{customer.notes || "-"}</p>
            )}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="rounded-2xl border border-border/70 bg-gradient-to-r from-orange-50 to-amber-50 p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Hurtighandlinger</h2>
          <div className="flex flex-wrap gap-3">
            {customer.phone && (
              <a
                href={`tel:${customer.phone}`}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-foreground shadow-sm hover:shadow-md transition-shadow"
              >
                <Phone className="h-4 w-4 text-orange-600" />
                Ring op
              </a>
            )}
            {customer.phone && (
              <a
                href={`sms:${customer.phone}`}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-foreground shadow-sm hover:shadow-md transition-shadow"
              >
                <MessageSquare className="h-4 w-4 text-orange-600" />
                Send SMS
              </a>
            )}
            <Link
              href={`/admin/bookings/new?customer=${customerId}`}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-foreground shadow-sm hover:shadow-md transition-shadow"
            >
              <Calendar className="h-4 w-4 text-orange-600" />
              Opret booking
            </Link>
            <button
              onClick={() => alert("Send tilbud-funktionalitet kommer snart")}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-foreground shadow-sm hover:shadow-md transition-shadow"
            >
              <ArrowRight className="h-4 w-4 text-orange-600" />
              Send tilbud
            </button>
          </div>
        </section>

        {/* Timeline */}
        {timeline.length > 0 && (
          <section className="rounded-2xl border border-border/70 bg-white/70 p-6 md:p-8">
            <h2 className="mb-6 text-xl font-semibold text-foreground">Tidslinje</h2>
            <div className="space-y-4">
              {timeline.map((event, idx) => {
                const IconComponent =
                  event.type === "lead"
                    ? User
                    : event.type === "estimator"
                      ? Camera
                      : Calendar;

                return (
                  <div key={event.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="rounded-full bg-orange-100 p-2 text-orange-600">
                        <IconComponent className="h-4 w-4" />
                      </div>
                      {idx < timeline.length - 1 && (
                        <div className="my-1 h-12 w-0.5 bg-gray-200" />
                      )}
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-medium text-foreground">{event.title}</span>
                        {event.status && (
                          <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(event.status)}`}>
                            {getStatusLabel(event.status)}
                          </span>
                        )}
                      </div>
                      {event.subtitle && (
                        <p className="text-sm text-muted-foreground">{event.subtitle}</p>
                      )}
                      <p className="text-xs text-muted-foreground">{formatDateTime(event.timestamp)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Bookings */}
        {bookings.length > 0 && (
          <section className="rounded-2xl border border-border/70 bg-white/70 p-6 md:p-8">
            <h2 className="mb-6 text-xl font-semibold text-foreground">Booking-historik</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 text-left">
                    <th className="px-4 py-3 font-semibold text-muted-foreground">ID</th>
                    <th className="px-4 py-3 font-semibold text-muted-foreground">Dato</th>
                    <th className="px-4 py-3 font-semibold text-muted-foreground">Status</th>
                    <th className="px-4 py-3 font-semibold text-muted-foreground">Oprettet</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="border-b border-border/30 hover:bg-orange-50/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/bookings/${booking.id}`}
                          className="text-orange-600 hover:underline font-medium"
                        >
                          {booking.id.slice(0, 8)}...
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        {booking.date ? formatDate(booking.date) : "-"}
                      </td>
                      <td className="px-4 py-3">
                        {booking.status && (
                          <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(booking.status)}`}>
                            {getStatusLabel(booking.status)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(booking.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </main>
  );
};
