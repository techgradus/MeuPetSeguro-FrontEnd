import { useSyncExternalStore } from 'react';

/*
 * Foto de perfil do usuário.
 *
 * Store simples (sem Provider), no mesmo estilo do `useAppTheme`: quando a
 * foto muda em "Minha conta", a tela de Configurações também atualiza.
 *
 * A foto vale enquanto o app está aberto. Para guardar de forma permanente,
 * envie a imagem para a API (ou copie o arquivo para a pasta do app) dentro
 * de `setProfilePhoto`.
 */

let photoUri: string | null = null;
const listeners = new Set<() => void>();

export function setProfilePhoto(uri: string | null) {
  if (uri === photoUri) return;
  photoUri = uri;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => photoUri;

/** URI da foto de perfil atual (ou null quando não há foto). */
export function useProfilePhoto() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}