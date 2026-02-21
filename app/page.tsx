import Link from "next/link";

export default function HomePage() {
  return (
    <main className="content-shell">
      <section className="minimal-card">
        <h1>AI Booking Scheduler Kit</h1>
        <p>This project includes a complete booking flow with timezone-safe slots and an AI scheduling assistant.</p>
        <p>
          Open the booking interface at <Link href="/booking">/booking</Link>.
        </p>
      </section>
    </main>
  );
}
