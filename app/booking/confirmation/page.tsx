import Link from "next/link";

interface ConfirmationPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstParam(value: string | string[] | undefined): string | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

export default async function ConfirmationPage({ searchParams }: ConfirmationPageProps) {
  const params = await searchParams;
  const name = firstParam(params.name) ?? "Guest";
  const start = firstParam(params.start) ?? "Unknown time";

  return (
    <main className="content-shell">
      <section className="minimal-card">
        <h1>Booking Confirmed</h1>
        <p>{name}, your booking has been confirmed.</p>
        <p>Start time (UTC): {start}</p>
        <p>
          <Link href="/booking">Back to booking</Link>
        </p>
      </section>
    </main>
  );
}
