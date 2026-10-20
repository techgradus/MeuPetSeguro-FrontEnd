const two = (n: number) => String(n).padStart(2, '0');

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/** "Agora", "Há 12 min", "Há 3h", "Hoje, 09:10", "Ontem, 17:42" ou "22/08, 17:42". */
export function formatAlertTime(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  const diffMin = Math.floor((now.getTime() - date.getTime()) / 60000);
  const clock = `${two(date.getHours())}:${two(date.getMinutes())}`;

  if (diffMin < 1) return 'Agora';
  if (diffMin < 60) return `Há ${diffMin} min`;

  if (sameDay(date, now)) {
    return diffMin < 360 ? `Há ${Math.floor(diffMin / 60)}h` : `Hoje, ${clock}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (sameDay(date, yesterday)) return `Ontem, ${clock}`;

  return `${two(date.getDate())}/${two(date.getMonth() + 1)}, ${clock}`;
}