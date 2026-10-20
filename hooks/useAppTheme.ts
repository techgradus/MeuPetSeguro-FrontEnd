import { useSyncExternalStore } from 'react';

import { mapColor } from '@/constants/darkTheme';

/*
 * Estado global do modo escuro.
 *
 * É um store simples (sem Provider), então não precisa mexer no _layout.tsx:
 * qualquer tela que usa `useAppTheme()` ou `useLayout()` atualiza sozinha
 * quando o modo muda.
 *
 * Na web a escolha fica salva no navegador. No celular ela vale enquanto o
 * app está aberto; para guardar de forma permanente, grave o valor com o
 * @react-native-async-storage/async-storage dentro de `setDarkMode`.
 */

const STORAGE_KEY = 'meupet:theme';

let dark = false;
const listeners = new Set<() => void>();

try {
  if (typeof localStorage !== 'undefined') {
    dark = localStorage.getItem(STORAGE_KEY) === 'dark';
  }
} catch {
  // sem acesso ao armazenamento: segue no modo claro
}

export function setDarkMode(value: boolean) {
  if (value === dark) return;
  dark = value;

  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, value ? 'dark' : 'light');
    }
  } catch {
    // ignora
  }

  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => dark;

export function useAppTheme() {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return {
    dark: isDark,
    setDark: setDarkMode,
    /** Converte uma cor de fundo usada direto no JSX */
    bg: (color: string) => mapColor(color, 'bg', isDark),
    /** Converte uma cor de texto/ícone usada direto no JSX */
    tx: (color: string) => mapColor(color, 'text', isDark),
  };
}