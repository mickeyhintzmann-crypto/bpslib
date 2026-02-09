"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";

const SLOT_TIMES = ["08:00", "11:00", "13:30"] as const;

type OverrideItem = {
  date: string;
  open_slots_count: number | null;
  show_on_acute_page: boolean | null;
  note: string | null;
  updated_at?: string | null;
};

type BookingItem = {
  id: string;
  date: string;
  start_slot_index: number | null;
  slot_count: number | null;
  source: string | null;
  status: string | null;
  customer_name: string | null;
  postal_code: string | null;
};

type CalendarRow = {
  dateKey: string;
  dateLabel: string;
  openSlotsCount: number;
  showOnAcutePage: boolean;
  note: string;
};

type CalendarResponse = {
  overrides?: OverrideItem[];
  bookings?: BookingItem[];
  message?: string;
};

const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatLabel = (date: Date) =>
  date.toLocaleDateString("da-DK", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit"
  });

const baseOpenSlots = (weekday: number) => {
  if (weekday === 0) {
    return 1;
  }
  if (weekday === 6) {
    return 2;
  }
  return 3;
};

const buildRows = (days: number): CalendarRow[] => {
  const start = new Date();
  const rows: CalendarRow[] = [];

  for (let index = 0; index < days; index += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + index);

    rows.push({
      dateKey: toDateKey(date),
      dateLabel: formatLabel(date),
      openSlotsCount: baseOpenSlots(date.getDay()),
      showOnAcutePage: true,
      note: ""
    });
  }

  return rows;
};

export const CalendarAdmin = () => {
  const [rows, setRows] = useState<CalendarRow[]>(() => buildRows(30));
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rowMessages, setRowMessages] = useState<Record<string, string>>({});

  const dateFrom = rows[0]?.dateKey || "";
  const dateTo = rows[rows.length - 1]?.dateKey || "";


  const mergeOverrides = (items: OverrideItem[]) => {
    const overrideMap = new Map(items.map((item) => [item.date, item]));

    setRows((current) =>
      current.map((row) => {
        const override = overrideMap.get(row.dateKey);
        if (!override) {
          return row;
        }

        return {
          ...row,
          openSlotsCount:
            typeof override.open_slots_count === "number" ? override.open_slots_count : row.openSlotsCount,
          showOnAcutePage:
            typeof override.show_on_acute_page === "boolean"
              ? override.show_on_acute_page
              : row.showOnAcutePage,
          note: override.note || ""
        };
      })
    );
  };

  const bookingsByDate = useMemo(() => {
    const map: Record<string, BookingItem[]> = {};
    bookings.forEach((booking) => {
      if (!booking.date) {
        return;
      }
      if (!map[booking.date]) {
        map[booking.date] = [];
      }
      map[booking.date].push(booking);
    });
    return map;
  }, [bookings]);

  const isActiveStatus = (status: string | null) => {
    if (!status) {
      return true;
    }
    const normalized = status.toLowerCase();
    return normalized !== "cancelled" && normalized !== "annulleret";
  };

  const loadCalendar = async () => {
    if (!dateFrom || !dateTo) {
      setError("Kunne ikke beregne datointerval.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/calendar?from=${dateFrom}&to=${dateTo}`,
        {
          cache: "no-store"
        }
      );

      const payload = (await response.json()) as CalendarResponse;
      if (!response.ok || !payload.overrides || !payload.bookings) {
        setError(payload.message || "Kunne ikke hente overrides.");
        return;
      }

      mergeOverrides(payload.overrides);
      setBookings(payload.bookings);
    } catch (fetchError) {
      console.error(fetchError);
      setError("Netværksfejl ved hentning af overrides.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalendar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateRow = (dateKey: string, patch: Partial<CalendarRow>) => {
    setRows((current) =>
      current.map((row) => (row.dateKey === dateKey ? { ...row, ...patch } : row))
    );
  };

  const buildSlotStates = (row: CalendarRow, dayBookings: BookingItem[]) => {
    const states = SLOT_TIMES.map((time, index) => ({
      index,
      time,
      state: row.openSlotsCount > index ? "available" : "closed",
      booking: null as BookingItem | null
    }));

    dayBookings.forEach((booking) => {
      if (!isActiveStatus(booking.status)) {
        return;
      }

      const startIndex = booking.start_slot_index ?? -1;
      if (startIndex < 0 || startIndex > 2) {
        return;
      }

      const slotCount = booking.slot_count && booking.slot_count > 0 ? booking.slot_count : 1;

      for (let offset = 0; offset < slotCount; offset += 1) {
        const slotIndex = startIndex + offset;
        if (slotIndex > 2) {
          continue;
        }
        states[slotIndex] = {
          ...states[slotIndex],
          state: offset === 0 ? "booked" : "blocked",
          booking
        };
      }
    });

    return states;
  };

  const saveRow = async (row: CalendarRow) => {
    setRowMessages((current) => ({ ...current, [row.dateKey]: "Gemmer..." }));

    try {
      const response = await fetch("/api/admin/day-overrides", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          date: row.dateKey,
          open_slots_count: row.openSlotsCount,
          show_on_acute_page: row.showOnAcutePage,
          note: row.note.trim() ? row.note.trim() : null
        })
      });

      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        setRowMessages((current) => ({
          ...current,
          [row.dateKey]: payload.message || "Kunne ikke gemme."
        }));
        return;
      }

      setRowMessages((current) => ({ ...current, [row.dateKey]: "Gemt" }));

      setTimeout(() => {
        setRowMessages((current) => {
          const next = { ...current };
          delete next[row.dateKey];
          return next;
        });
      }, 1500);
    } catch (saveError) {
      console.error(saveError);
      setRowMessages((current) => ({ ...current, [row.dateKey]: "Netværksfejl" }));
    }
  };

  return (
    <section className="space-y-6 rounded-2xl border border-border/70 bg-white/70 p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">Kalender</h1>
          <p className="text-sm text-muted-foreground">
            Styr aabne slots, akutte tider og noter for de naeste 30 dage.
          </p>
        </div>
        <Button onClick={() => loadCalendar()} disabled={loading}>
          {loading ? "Henter..." : "Opdater"}
        </Button>
      </div>

      {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}

      <div className="space-y-3">
        {rows.map((row) => (
          <div
            key={row.dateKey}
            className="space-y-3 rounded-xl border border-border bg-background/70 p-4"
          >
            <div className="grid gap-3 md:grid-cols-[1.4fr_0.7fr_1fr_1.6fr_auto]">
              <div>
                <p className="text-sm font-semibold text-foreground">{row.dateLabel}</p>
                <p className="text-xs text-muted-foreground">{row.dateKey}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Aabne slots</p>
                <select
                  value={row.openSlotsCount}
                  onChange={(event) => updateRow(row.dateKey, { openSlotsCount: Number(event.target.value) })}
                  className="h-9 w-full rounded-md border border-border bg-white px-2 text-sm"
                >
                  <option value={0}>0</option>
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                </select>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Vis paa akutte tider</p>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={row.showOnAcutePage}
                    onChange={(event) => updateRow(row.dateKey, { showOnAcutePage: event.target.checked })}
                  />
                  {row.showOnAcutePage ? "Ja" : "Nej"}
                </label>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Note</p>
                <input
                  value={row.note}
                  onChange={(event) => updateRow(row.dateKey, { note: event.target.value })}
                  className="h-9 w-full rounded-md border border-border bg-white px-2 text-sm"
                  placeholder="Kort note"
                />
              </div>
              <div className="flex flex-col items-end gap-2">
                <Button size="sm" onClick={() => saveRow(row)}>
                  Gem
                </Button>
                {rowMessages[row.dateKey] ? (
                  <span className="text-xs text-muted-foreground">{rowMessages[row.dateKey]}</span>
                ) : null}
              </div>
            </div>
            <div className="space-y-2 rounded-lg border border-border/60 bg-white/60 p-3">
              {row.openSlotsCount === 0 ? (
                <p className="text-xs font-semibold text-red-700">LUKKET</p>
              ) : null}
              <div className="grid gap-3 md:grid-cols-3">
                {buildSlotStates(row, bookingsByDate[row.dateKey] || []).map((slot) => {
                  const isClosed = slot.state === "closed";
                  const isBooked = slot.state === "booked";
                  const isBlocked = slot.state === "blocked";
                  const booking = slot.booking;
                  const label = isClosed
                    ? "Lukket"
                    : isBooked
                      ? "Booket"
                      : isBlocked
                        ? "Optaget"
                        : "Ledig";
                  const detail =
                    booking && (isBooked || isBlocked)
                      ? `${booking.customer_name || "Ukendt"} · ${booking.source || "ukendt"} · ${booking.status || "ukendt"}`
                      : "";

                  return (
                    <div key={`${row.dateKey}-${slot.time}`} className="space-y-2 rounded-lg border border-border/60 p-3">
                      <button
                        type="button"
                        disabled={isClosed}
                        className={`w-full rounded-md px-3 py-2 text-sm font-semibold ${
                          isClosed
                            ? "cursor-not-allowed bg-muted/60 text-muted-foreground"
                            : isBooked || isBlocked
                              ? "bg-foreground text-white"
                              : "bg-secondary text-secondary-foreground"
                        }`}
                      >
                        {slot.time}
                      </button>
                      <p className="text-xs text-muted-foreground">{label}</p>
                      {detail && booking ? (
                        <Link
                          href={`/admin/bookings/${booking.id}`}
                          className="text-xs font-medium text-foreground underline"
                        >
                          {detail}
                        </Link>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
