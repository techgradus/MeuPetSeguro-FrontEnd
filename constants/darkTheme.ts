/*
 * Tema escuro.
 *
 * As telas foram desenhadas com cores do tema claro. Em vez de reescrever
 * cada cor, `themed()` converte automaticamente as cores dos estilos quando
 * o modo escuro está ligado:
 *
 *  - fundos claros (branco, cinzas e tons pastéis) viram fundos escuros;
 *  - bordas claras viram bordas escuras, um pouco mais claras que o fundo;
 *  - textos escuros e neutros viram textos claros;
 *  - cores vivas (verde do tema, laranja, azul, vermelho) ficam como estão.
 *
 * Para mexer no resultado, ajuste os números em `mapColor` abaixo.
 */

export type ColorRole = 'bg' | 'text' | 'border';

type Hsl = { h: number; s: number; l: number; chroma: number };

function parseHex(value: string): [number, number, number] | null {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value.trim());
  if (!m) return null;

  let hex = m[1];
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((c) => c + c)
      .join('');
  }

  return [
    parseInt(hex.slice(0, 2), 16) / 255,
    parseInt(hex.slice(2, 4), 16) / 255,
    parseInt(hex.slice(4, 6), 16) / 255,
  ];
}

function toHsl([r, g, b]: [number, number, number]): Hsl {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const chroma = max - min;
  const l = (max + min) / 2;

  let h = 0;
  if (chroma !== 0) {
    if (max === r) h = ((g - b) / chroma) % 6;
    else if (max === g) h = (b - r) / chroma + 2;
    else h = (r - g) / chroma + 4;
    h *= 60;
    if (h < 0) h += 360;
  }

  const s = chroma === 0 ? 0 : chroma / (1 - Math.abs(2 * l - 1));

  return { h, s, l, chroma };
}

function hslToHex(h: number, s: number, l: number): string {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  const to = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, '0');

  return `#${to(r)}${to(g)}${to(b)}`.toUpperCase();
}

const clamp = (v: number, min: number, max: number) =>
  Math.min(Math.max(v, min), max);

/** Converte uma cor do tema claro para o tema escuro. */
export function mapColor(value: string, role: ColorRole, dark: boolean) {
  if (!dark || typeof value !== 'string') return value;

  const rgb = parseHex(value);
  if (!rgb) return value; // rgba(), 'transparent' etc. ficam como estão

  const { h, s, l, chroma } = toHsl(rgb);

  /* TEXTOS E ÍCONES */
  if (role === 'text') {
    // só escuros e pouco coloridos viram claros; o verde do tema e as cores
    // vivas continuam iguais, e os claros (texto sobre o card verde) também
    if (l < 0.6 && s < 0.5) {
      return hslToHex(h, Math.min(s, 0.2), clamp(1 - l, 0.62, 0.95));
    }
    return value;
  }

  /* BORDAS */
  if (role === 'border') {
    if (l < 0.7) return value;

    if (chroma >= 0.25) return hslToHex(h, 0.4, 0.38); // destaque (atenção)
    if (chroma >= 0.15) return hslToHex(h, 0.3, 0.3); // verde-água de cards
    return hslToHex(h, 0.12, 0.24); // borda neutra
  }

  /* FUNDOS */
  if (l < 0.8) return value; // cores vivas e escuras ficam como estão

  // branco puro e quase branco: cards
  if (l >= 0.985 && chroma < 0.03) return '#1A2323';

  // tons pastéis com cor (chips, ícones, avisos): escuros com o mesmo tom
  if (chroma >= 0.06) return hslToHex(h, 0.3, 0.2);

  // neutros claros: fundo da tela e controles
  return hslToHex(h, 0.1, clamp(0.1 + (0.975 - l) * 1.2, 0.08, 0.22));
}

const TEXT_PROPS = new Set(['color', 'tintColor', 'textDecorationColor']);
const BG_PROPS = new Set(['backgroundColor']);
const BORDER_PROPS = new Set([
  'borderColor',
  'borderTopColor',
  'borderBottomColor',
  'borderLeftColor',
  'borderRightColor',
]);

/**
 * Aplica o tema escuro a um objeto de estilos antes do StyleSheet.create.
 * No modo claro devolve os estilos sem alterar nada.
 */
export function themed<T extends Record<string, any>>(
  styles: T,
  dark: boolean,
): T {
  if (!dark) return styles;

  const out: Record<string, any> = {};

  for (const [name, style] of Object.entries(styles)) {
    const next: Record<string, any> = {};

    for (const [prop, val] of Object.entries(style as object)) {
      if (typeof val !== 'string') {
        next[prop] = val;
      } else if (TEXT_PROPS.has(prop)) {
        next[prop] = mapColor(val, 'text', true);
      } else if (BG_PROPS.has(prop)) {
        next[prop] = mapColor(val, 'bg', true);
      } else if (BORDER_PROPS.has(prop)) {
        next[prop] = mapColor(val, 'border', true);
      } else {
        next[prop] = val;
      }
    }

    out[name] = next;
  }

  return out as T;
}