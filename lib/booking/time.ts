const DEFAULT_START_HOUR = 9;
const DEFAULT_END_HOUR = 17;

export function safeTimezone(input?: string): string {
  if (!input) return "UTC";
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: input }).format(new Date());
    return input;
  } catch {
    return "UTC";
  }
}

export function formatInTimezone(isoUtc: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    timeZone,
    timeZoneName: "short",
  }).format(new Date(isoUtc));
}

function readLocalParts(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const parts = formatter.formatToParts(date);
  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return {
    localDate: `${map.year}-${map.month}-${map.day}`,
    hour: Number(map.hour),
    minute: Number(map.minute),
  };
}

export function generateUtcSlotsForDate(params: {
  date: string;
  timeZone: string;
  slotMinutes: number;
  startHour?: number;
  endHour?: number;
}) {
  const {
    date,
    timeZone,
    slotMinutes,
    startHour = DEFAULT_START_HOUR,
    endHour = DEFAULT_END_HOUR,
  } = params;

  const matchesDatePattern = /^\d{4}-\d{2}-\d{2}$/.test(date);
  if (!matchesDatePattern) {
    throw new Error("Invalid date format. Expected YYYY-MM-DD.");
  }

  const utcMidnight = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(utcMidnight.getTime())) {
    throw new Error("Invalid date format. Expected YYYY-MM-DD.");
  }

  // Wide scan window to safely capture any timezone offset and DST transitions.
  const scanStart = new Date(utcMidnight.getTime() - 18 * 60 * 60_000);
  const scanEnd = new Date(utcMidnight.getTime() + 42 * 60 * 60_000);
  const slots: Array<{ startUtc: string; endUtc: string }> = [];
  const seen = new Set<string>();

  for (let t = scanStart.getTime(); t <= scanEnd.getTime(); t += slotMinutes * 60_000) {
    const utcInstant = new Date(t);
    const local = readLocalParts(utcInstant, timeZone);

    if (local.localDate !== date) {
      continue;
    }
    if (local.hour < startHour || local.hour >= endHour) {
      continue;
    }
    if (local.minute % slotMinutes !== 0) {
      continue;
    }

    const startUtc = utcInstant.toISOString();
    if (seen.has(startUtc)) {
      continue;
    }
    seen.add(startUtc);
    const endUtc = new Date(utcInstant.getTime() + slotMinutes * 60_000).toISOString();
    slots.push({ startUtc, endUtc });
  }

  return slots;
}

export function overlaps(aStartUtc: string, aEndUtc: string, bStartUtc: string, bEndUtc: string): boolean {
  const aStart = new Date(aStartUtc).getTime();
  const aEnd = new Date(aEndUtc).getTime();
  const bStart = new Date(bStartUtc).getTime();
  const bEnd = new Date(bEndUtc).getTime();
  return aStart < bEnd && bStart < aEnd;
}
