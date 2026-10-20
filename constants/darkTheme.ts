/*
 * Modo escuro.
 * As telas continuam escritas com as cores claras do design (petTheme/ui).
 * `themed(estilos, dark)` troca essas cores pelas equivalentes escuras quando
 * o modo escuro está ligado — assim não é preciso duplicar nenhum estilo.
 */

const norm = (v: string) => v.trim().toUpperCase();

/** Fundos e bordas: cor clara -> cor escura. */
const SURFACE: Record<string, string> = {
  '#F3FAF9': '#0E1A1A', '#F6FBFB': '#0E1A1A', '#E9F3F2': '#081212',
  '#FFFFFF': '#172524', '#FBFFFD': '#172524', '#FDFEFB': '#132120',
  '#C8F0EC': '#1F3B38', '#C6F1EC': '#1F3B38',
  '#D5E6E4': '#2B3E3C', '#D2E8E3': '#2B3E3C', '#CDEEE8': '#2B3E3C',
  '#BFEBD6': '#2B3E3C', '#E3ECEA': '#2B3E3C', '#B5BFBD': '#2B3E3C',
  '#E4ECEB': '#2B3E3C', '#E1E1E1': '#2B3E3C',
  '#FDECEC': '#3A2022', '#FFE1DA': '#3A2022', '#F5C2B5': '#5A2F2F',
  '#E3F6EC': '#17332A', '#F6E0B8': '#3B3118', '#FFF0D5': '#3B3118',
};

/** Textos e ícones: cor clara -> cor escura. */
const TEXT: Record<string, string> = {
  '#0F2B2B': '#EAF4F3', '#111111': '#EAF4F3',
  '#5C7775': '#9DB5B2', '#6F8481': '#9DB5B2', '#777777': '#9DB5B2',
  '#00857C': '#3CC4B8', '#006B64': '#3CC4B8',
  '#9A6B00': '#E3B341', '#E5484D': '#FF7478',
};

const TEXT_KEYS = new Set(['color', 'tintColor']);
const SURFACE_KEYS = new Set([
  'backgroundColor', 'borderColor', 'borderTopColor', 'borderBottomColor',
  'borderLeftColor', 'borderRightColor',
]);

// Fundos "de destaque" (botões, cartão verde) não devem trocar de cor.
const KEEP_SURFACE = new Set(['#00857C', '#006B64']);

export function themed<T extends Record<string, any>>(styles: T, dark: boolean): T {
  if (!dark) return styles;
  const out: Record<string, any> = {};
  for (const name of Object.keys(styles)) {
    const style = styles[name];
    if (!style || typeof style !== 'object') { out[name] = style; continue; }
    const next: Record<string, any> = { ...style };
    for (const key of Object.keys(next)) {
      const value = next[key];
      if (typeof value !== 'string') continue;
      const hex = norm(value);
      if (TEXT_KEYS.has(key) && TEXT[hex]) next[key] = TEXT[hex];
      else if (SURFACE_KEYS.has(key) && !KEEP_SURFACE.has(hex) && SURFACE[hex]) next[key] = SURFACE[hex];
    }
    out[name] = next;
  }
  return out as T;
}

/** Cor de texto/ícone para uso direto no JSX (ex.: <Ionicons color={c.text} />). */
export const textColor = (value: string, dark: boolean) => (dark ? TEXT[norm(value)] ?? value : value);

/** Cor de fundo para uso direto no JSX. */
export const surfaceColor = (value: string, dark: boolean) =>
  dark && !KEEP_SURFACE.has(norm(value)) ? SURFACE[norm(value)] ?? value : value;
