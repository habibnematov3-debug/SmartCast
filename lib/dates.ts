const DAY_MS = 24 * 60 * 60 * 1000;

export function parseDateOnly(input: string) {
  return new Date(`${input}T00:00:00.000Z`);
}

export function isValidDateRange(start: Date, end: Date) {
  return !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && end >= start;
}

export function daysInclusive(start: Date, end: Date) {
  const diff = Math.floor((end.getTime() - start.getTime()) / DAY_MS);
  return diff + 1;
}

export function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * DAY_MS);
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  }).format(date);
}