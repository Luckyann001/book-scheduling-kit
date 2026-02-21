import { randomUUID } from "crypto";
import { overlaps } from "./time";
import type { Reservation, ReservationRequest } from "./types";

const DEFAULT_DURATION_MINUTES = 30;

class BookingStore {
  private reservations: Reservation[] = [];

  listActiveReservations(): Reservation[] {
    return this.reservations.filter((r) => r.status === "confirmed");
  }

  listForEmail(email?: string): Reservation[] {
    if (!email) return this.listActiveReservations();
    return this.listActiveReservations().filter((r) => r.email.toLowerCase() === email.toLowerCase());
  }

  hasConflict(startUtc: string, endUtc: string): boolean {
    return this.listActiveReservations().some((r) => overlaps(startUtc, endUtc, r.startUtc, r.endUtc));
  }

  create(request: ReservationRequest): Reservation {
    const durationMinutes = request.durationMinutes ?? DEFAULT_DURATION_MINUTES;
    if (!Number.isFinite(durationMinutes) || durationMinutes <= 0 || durationMinutes > 240) {
      throw new Error("Duration must be between 1 and 240 minutes.");
    }
    const start = new Date(request.startUtc);

    if (Number.isNaN(start.getTime())) {
      throw new Error("Invalid startUtc timestamp.");
    }

    const endUtc = new Date(start.getTime() + durationMinutes * 60_000).toISOString();
    if (this.hasConflict(request.startUtc, endUtc)) {
      throw new Error("Selected slot is no longer available.");
    }

    const reservation: Reservation = {
      id: randomUUID(),
      name: request.name,
      email: request.email,
      phone: request.phone,
      timezone: request.timezone,
      notes: request.notes,
      startUtc: request.startUtc,
      endUtc,
      createdAtUtc: new Date().toISOString(),
      status: "confirmed",
    };

    this.reservations.push(reservation);
    return reservation;
  }

  cancel(id: string): Reservation {
    const reservation = this.reservations.find((r) => r.id === id);
    if (!reservation || reservation.status === "cancelled") {
      throw new Error("Reservation not found.");
    }

    reservation.status = "cancelled";
    return reservation;
  }
}

declare global {
  // eslint-disable-next-line no-var
  var bookingStoreSingleton: BookingStore | undefined;
}

export const bookingStore = globalThis.bookingStoreSingleton ?? new BookingStore();
if (!globalThis.bookingStoreSingleton) {
  globalThis.bookingStoreSingleton = bookingStore;
}
