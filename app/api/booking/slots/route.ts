import { NextResponse } from "next/server";
import { bookingStore } from "../../../../lib/booking/store";
import { generateUtcSlotsForDate, safeTimezone } from "../../../../lib/booking/time";
import type { Slot } from "../../../../lib/booking/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const timezone = safeTimezone(searchParams.get("timezone") ?? "UTC");
  const slotMinutes = Number(searchParams.get("slotMinutes") ?? "30");

  if (!date) {
    return NextResponse.json({ error: "Missing required query parameter: date (YYYY-MM-DD)." }, { status: 400 });
  }

  if (!Number.isFinite(slotMinutes) || slotMinutes <= 0 || slotMinutes > 120) {
    return NextResponse.json({ error: "slotMinutes must be a number between 1 and 120." }, { status: 400 });
  }

  try {
    const candidates = generateUtcSlotsForDate({ date, timeZone: timezone, slotMinutes });
    const slots: Slot[] = candidates.map((slot) => ({
      ...slot,
      status: bookingStore.hasConflict(slot.startUtc, slot.endUtc) ? "booked" : "available",
    }));

    return NextResponse.json({
      date,
      timezone,
      slotMinutes,
      slots,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to fetch slots." }, { status: 400 });
  }
}
