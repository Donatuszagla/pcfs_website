export function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Africa/Accra",
  }).format(new Date(value));
}

export function formatDateRange(startAt: string, endAt: string): string {
  return `${formatDate(startAt)} – ${formatDate(endAt)}`;
}
