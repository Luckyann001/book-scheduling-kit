import { NextResponse } from "next/server";
import { reminders } from "../../../../lib/booking/reminders";
import { bookingStore } from "../../../../lib/booking/store";
import { safeTimezone } from "../../../../lib/booking/time";
import type { ReservationRequest } from "../../../../lib/booking/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email") ?? undefined;
  const reservations = bookingStore.listForEmail(email);
  return NextResponse.json({ reservations });
}

export async function POST(request: Request) {
  let body: ReservationRequest;

  try {
    body = (await request.json()) as ReservationRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body?.name || !body?.email || !body?.startUtc) {
    return NextResponse.json({ error: "name, email, and startUtc are required." }, { status: 400 });
  }

  try {
    const reservation = bookingStore.create({
      ...body,
      timezone: safeTimezone(body.timezone),
    });

    await Promise.allSettled([
      reminders.sendEmailReminder(reservation),
      reminders.sendSmsReminder(reservation),
    ]);

    return NextResponse.json({ reservation }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create reservation.";
    const status = message === "Selected slot is no longer available." ? 409 : 400;
    return NextResponse.json(
      { error: message },
      { status },
    );
  }
}

export async function DELETE(request: Request) {
  let body: { id?: string };
  try {
    body = (await request.json()) as { id?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.id) {
    return NextResponse.json({ error: "Reservation id is required." }, { status: 400 });
  }

  try {
    const reservation = bookingStore.cancel(body.id);
    return NextResponse.json({ reservation });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to cancel reservation." }, { status: 404 });
  }
}
