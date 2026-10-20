import { useMemo, useSyncExternalStore } from 'react';
import { Platform } from 'react-native';
import { colors } from '@/constants/petTheme';
import { surfaceColor, textColor } from '@/constants/darkTheme';

/*
 * Tema do app (claro/escuro) — estado global simples, sem biblioteca.
 * TODO: salvar a preferência no perfil do usuário quando existir API.
 */

const STORAGE_KEY = 'meupetseguro:dark';
const listeners = new Set<() => void>();

function readInitial(): boolean {
  try {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY) === '1';
    }
  } catch {}
  return false;
}

let darkMode = readInitial();

function setDarkMode(value: boolean) {
  if (value === darkMode) return;
  darkMode = value;
  try {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, value ? '1' : '0');
    }
  } catch {}
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => { listeners.delete(l); };
};

export function useAppTheme() {
  const dark = useSyncExternalStore(subscribe, () => darkMode, () => darkMode);

  // Cores prontas para usar direto no JSX (ícones, indicadores etc.)
  const c = useMemo(() => ({
    text: textColor(colors.text, dark),
    muted: textColor(colors.textMuted, dark),
    primary: textColor(colors.primary, dark),
    surface: surfaceColor(colors.surface, dark),
    background: surfaceColor(colors.background, dark),
  }), [dark]);

  return { dark, c, setDark: setDarkMode, toggle: () => setDarkMode(!darkMode) };
}
