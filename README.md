# AI Booking Scheduler Kit

Complete Next.js + TypeScript kit for timezone-aware booking with slot selection, reservations, cancellation, reminders integration points, and an AI scheduling assistant endpoint.

## What Is Included
- Booking UI with date + slot selection
- Reservation form with confirmation state
- Dedicated confirmation screen at `/booking/confirmation`
- Upcoming bookings + cancellation flow
- Slot availability API with conflict marking
- Reservation API (`GET` / `POST` / `DELETE`)
- Natural-language scheduling assistant API
- Timezone-safe UTC storage and overlap checks
- Reminder adapter stubs for email/SMS integrations

## Project Structure
- `app/layout.tsx`
- `app/page.tsx`
- `app/booking/page.tsx`
- `app/booking/confirmation/page.tsx`
- `app/api/booking/slots/route.ts`
- `app/api/booking/reservations/route.ts`
- `app/api/ai/scheduling-assistant/route.ts`
- `components/booking/CalendarView.tsx`
- `components/booking/SlotPicker.tsx`
- `components/booking/BookingForm.tsx`
- `components/booking/UpcomingBookings.tsx`
- `lib/booking/types.ts`
- `lib/booking/time.ts`
- `lib/booking/store.ts`
- `lib/booking/reminders.ts`
- `package.json`
- `tsconfig.json`
- `next.config.ts`
- `.env.example`

## Setup
1. Install dependencies:
   - `npm install`
2. Configure environment:
   - `cp .env.example .env.local`
   - set `OPENAI_API_KEY` (optional; fallback suggestions work without it)
3. Start app:
   - `npm run dev`
4. Open:
   - `http://localhost:3000/booking`

## Environment Variables
- `OPENAI_API_KEY`: OpenAI key used by `/api/ai/scheduling-assistant`
- `OPENAI_SCHEDULING_MODEL` (optional): defaults to `gpt-4.1-mini`

## API Contract

### `GET /api/booking/slots`
Query params:
- `date` (required): `YYYY-MM-DD`
- `timezone` (optional): IANA timezone (defaults to UTC)
- `slotMinutes` (optional): `1..120` (defaults to `30`)

Returns:
- generated UTC slots for local business hours (`09:00-17:00`)
- each slot marked `available` or `booked`

### `GET /api/booking/reservations`
- Optional query: `email`
- Returns confirmed reservations (in-memory store)

### `POST /api/booking/reservations`
Body:
- `name`, `email`, `startUtc` required
- `phone`, `notes`, `timezone`, `durationMinutes` optional

Behavior:
- validates duration and timestamp
- rejects overlap conflicts (`409`)
- queues email/SMS reminder integration hooks

### `DELETE /api/booking/reservations`
Body:
- `id` required

Behavior:
- cancels reservation if it exists

### `POST /api/ai/scheduling-assistant`
Body:
- `message` required
- `timezone`, `durationMinutes` optional

Behavior:
- uses OpenAI Responses API if key configured
- falls back to deterministic heuristic suggestions if unavailable

## Data Model Assumptions
`Reservation` fields:
- `id: string`
- `name: string`
- `email: string`
- `phone?: string`
- `timezone: string`
- `notes?: string`
- `startUtc: string`
- `endUtc: string`
- `createdAtUtc: string`
- `status: "confirmed" | "cancelled"`

Assumptions:
- Availability hours are local `09:00-17:00`
- Default slot duration is `30` minutes
- UTC timestamps are the source of truth
- Conflict rule is strict overlap in UTC
- Persistence is in-memory singleton for kit simplicity

## Reminder Integration Points
Replace adapter stubs in `lib/booking/reminders.ts`:
- `sendEmailReminder(reservation)`
- `sendSmsReminder(reservation)`

Suggested providers:
- Email: SES, SendGrid, Resend
- SMS: Twilio, Vonage

## Production Hardening Checklist
- Add authentication and authorization
- Move store to persistent DB
- Add transactional/locking conflict protection
- Add rate limiting on booking and AI routes
- Add retryable queue workers for reminders
- Add tests for DST boundaries and concurrent booking attempts
