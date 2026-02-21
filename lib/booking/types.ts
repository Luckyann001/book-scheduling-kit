export type SlotStatus = "available" | "booked";

export interface Slot {
  startUtc: string;
  endUtc: string;
  status: SlotStatus;
}

export interface Reservation {
  id: string;
  name: string;
  email: string;
  phone?: string;
  timezone: string;
  notes?: string;
  startUtc: string;
  endUtc: string;
  createdAtUtc: string;
  status: "confirmed" | "cancelled";
}

export interface ReservationRequest {
  name: string;
  email: string;
  phone?: string;
  timezone: string;
  notes?: string;
  startUtc: string;
  durationMinutes?: number;
}
