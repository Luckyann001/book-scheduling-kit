import type { Reservation } from "./types";

export interface ReminderAdapters {
  sendEmailReminder: (reservation: Reservation) => Promise<void>;
  sendSmsReminder: (reservation: Reservation) => Promise<void>;
}

async function noopEmailReminder(reservation: Reservation): Promise<void> {
  // Integration point: replace with provider API call (SendGrid, SES, etc).
  console.info("[reminder:email] queued", { id: reservation.id, email: reservation.email });
}

async function noopSmsReminder(reservation: Reservation): Promise<void> {
  // Integration point: replace with provider API call (Twilio, Vonage, etc).
  if (!reservation.phone) return;
  console.info("[reminder:sms] queued", { id: reservation.id, phone: reservation.phone });
}

export const reminders: ReminderAdapters = {
  sendEmailReminder: noopEmailReminder,
  sendSmsReminder: noopSmsReminder,
};
