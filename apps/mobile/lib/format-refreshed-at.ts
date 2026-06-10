export function formatRefreshedAt(iso: string): string {
  const date = new Date(iso);
  const formatted = date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  return `Refreshed At: ${formatted}`;
}
