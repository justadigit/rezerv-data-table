export function formatClassTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(value));
}

export function formatAttendance(attendeeCount: number, capacity: number) {
  return `${attendeeCount} / ${capacity}`;
}
