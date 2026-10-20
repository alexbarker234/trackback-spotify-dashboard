export function catalogName(name: string | null | undefined): string {
  const trimmed = name?.trim();
  return trimmed ? trimmed : "Unavailable";
}
