/** Aplica a máscara dd/mm/aaaa enquanto a pessoa digita. */
export function maskDate(text: string): string {
  const d = text.replace(/\D/g, '').slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

/** "22/09/2026" -> "2026-09-22". Retorna null se a data não existir. */
export function brToIso(br: string): string | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(br);
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  const day = Number(dd);
  const month = Number(mm);
  const year = Number(yyyy);
  const date = new Date(year, month - 1, day);
  const valid =
    date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  if (!valid || year < 1990 || year > 2100) return null;
  return `${yyyy}-${mm}-${dd}`;
}

/** "2026-09-22" -> "22/09/2026" */
export function isoToBr(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

export function todayBr(): string {
  const n = new Date();
  const dd = String(n.getDate()).padStart(2, '0');
  const mm = String(n.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${n.getFullYear()}`;
}
