"use client";

import { formatInTimezone } from "../../lib/booking/time";
import type { Reservation } from "../../lib/booking/types";

interface UpcomingBookingsProps {
  timezone: string;
  reservations: Reservation[];
  onCancel: (id: string) => Promise<void>;
}

export function UpcomingBookings({ timezone, reservations, onCancel }: UpcomingBookingsProps) {
  return (
    <section>
      <h2 className="section-title">Upcoming bookings</h2>
      {reservations.length === 0 ? <p className="subtle-note">No bookings yet.</p> : null}
      <div className="reservations-list">
        {reservations.map((reservation) => (
          <article key={reservation.id} className="reservation-card">
            <div>
              <strong>{reservation.name}</strong> ({reservation.email})
            </div>
            <div>{formatInTimezone(reservation.startUtc, timezone)}</div>
            {reservation.notes ? <div>Note: {reservation.notes}</div> : null}
            <button className="danger-btn" type="button" onClick={() => onCancel(reservation.id)}>
              Cancel booking
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
