"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BookingForm } from "../../components/booking/BookingForm";
import { CalendarView } from "../../components/booking/CalendarView";
import { SlotPicker } from "../../components/booking/SlotPicker";
import { UpcomingBookings } from "../../components/booking/UpcomingBookings";
import { formatInTimezone } from "../../lib/booking/time";
import type { Reservation, Slot } from "../../lib/booking/types";

function todayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function BookingPage() {
  const timezone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC", []);
  const [date, setDate] = useState(todayIsoDate());
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedStartUtc, setSelectedStartUtc] = useState<string | undefined>();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<Reservation | null>(null);

  const loadSlots = useCallback(async () => {
    const response = await fetch(`/api/booking/slots?date=${date}&timezone=${encodeURIComponent(timezone)}&slotMinutes=30`);
    const payload = (await response.json()) as { slots?: Slot[]; error?: string };
    if (!response.ok) throw new Error(payload.error ?? "Failed to load slots.");
    setSlots(payload.slots ?? []);
  }, [date, timezone]);

  const loadReservations = useCallback(async () => {
    const response = await fetch("/api/booking/reservations");
    const payload = (await response.json()) as { reservations?: Reservation[]; error?: string };
    if (!response.ok) throw new Error(payload.error ?? "Failed to load reservations.");
    setReservations(payload.reservations ?? []);
  }, []);

  useEffect(() => {
    setError(null);
    setSelectedStartUtc(undefined);
    loadSlots().catch((e) => setError(e instanceof Error ? e.message : "Failed to load slots."));
  }, [loadSlots]);

  useEffect(() => {
    loadReservations().catch((e) => setError(e instanceof Error ? e.message : "Failed to load reservations."));
  }, [loadReservations]);

  return (
    <main className="booking-shell">
      <section className="booking-hero">
        <h1>Book Time With Confidence</h1>
        <p>
          A premium scheduling experience with timezone-safe slots, live conflict detection, booking confirmation,
          cancellation flow, and AI-powered time suggestions.
        </p>
      </section>

      {error ? (
        <div className="status-card status-error" role="alert">
          {error}
        </div>
      ) : null}

      {confirmation ? (
        <section className="status-card status-success">
          <h2>Booking confirmed</h2>
          <p>{confirmation.name}, your reservation is confirmed for {formatInTimezone(confirmation.startUtc, timezone)}.</p>
          <Link
            className="flow-link"
            href={`/booking/confirmation?name=${encodeURIComponent(confirmation.name)}&start=${encodeURIComponent(
              confirmation.startUtc,
            )}`}
          >
            Open confirmation screen
          </Link>
          <div>
            <button type="button" onClick={() => setConfirmation(null)}>
              Book another slot
            </button>
          </div>
        </section>
      ) : null}

      <div className="booking-grid">
        <div className="booking-panel span-7">
          <CalendarView selectedDate={date} onChange={setDate} />
        </div>

        <div className="booking-panel span-5">
          <SlotPicker
            timezone={timezone}
            slots={slots}
            selectedStartUtc={selectedStartUtc}
            onSelect={(startUtc) => {
              setSelectedStartUtc(startUtc);
              setConfirmation(null);
            }}
          />
        </div>

        <div className="booking-panel span-6">
          <BookingForm
            selectedStartUtc={selectedStartUtc}
            timezone={timezone}
            submitting={submitting}
            onSubmit={async (values) => {
              if (!selectedStartUtc) {
                setError("Please select a slot before booking.");
                return;
              }

              setSubmitting(true);
              setError(null);
              try {
                const response = await fetch("/api/booking/reservations", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    ...values,
                    timezone,
                    startUtc: selectedStartUtc,
                    durationMinutes: 30,
                  }),
                });

                const payload = (await response.json()) as { reservation?: Reservation; error?: string };
                if (!response.ok || !payload.reservation) {
                  throw new Error(payload.error ?? "Reservation failed.");
                }

                setConfirmation(payload.reservation);
                await Promise.all([loadSlots(), loadReservations()]);
              } catch (e) {
                setError(e instanceof Error ? e.message : "Failed to create reservation.");
              } finally {
                setSubmitting(false);
              }
            }}
            onAiAssist={async (message) => {
              const response = await fetch("/api/ai/scheduling-assistant", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message, timezone, durationMinutes: 30 }),
              });

              const payload = (await response.json()) as { suggestions?: string[]; error?: string };
              if (!response.ok) {
                throw new Error(payload.error ?? "AI assistant request failed.");
              }

              return payload.suggestions ?? [];
            }}
          />
        </div>

        <div className="booking-panel span-6">
          <UpcomingBookings
            timezone={timezone}
            reservations={reservations}
            onCancel={async (id) => {
              setError(null);
              const response = await fetch("/api/booking/reservations", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
              });

              const payload = (await response.json()) as { error?: string };
              if (!response.ok) {
                setError(payload.error ?? "Failed to cancel reservation.");
                return;
              }

              await Promise.all([loadSlots(), loadReservations()]);
            }}
          />
        </div>
      </div>
    </main>
  );
}
