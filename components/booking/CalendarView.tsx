"use client";

interface CalendarViewProps {
  selectedDate: string;
  onChange: (date: string) => void;
}

function nextDays(count: number): string[] {
  const days: string[] = [];
  const now = new Date();
  for (let i = 0; i < count; i += 1) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    days.push(`${year}-${month}-${day}`);
  }
  return days;
}

export function CalendarView({ selectedDate, onChange }: CalendarViewProps) {
  const dates = nextDays(14);

  return (
    <section>
      <h2 className="section-title">Choose a date</h2>
      <div className="date-rail">
        {dates.map((date) => {
          const selected = date === selectedDate;
          return (
            <button
              key={date}
              type="button"
              onClick={() => onChange(date)}
              className={`date-chip ${selected ? "active" : ""}`}
            >
              {new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </button>
          );
        })}
      </div>
    </section>
  );
}
