import { errorMessage } from '@/services/api';
import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

/**
 * - Recarrega ao ganhar foco e a cada `intervalMs` ("tempo real" por consulta periódica).
 * - `key` identifica o que está sendo carregado. Ao mudar, os dados antigos
 *   deixam de aparecer na hora, sem esperar a resposta nova.
 */
export function useLiveData<T>(key: string, load: () => Promise<T>, intervalMs: number) {
  const [state, setState] = useState<{ key: string; data: T } | null>(null);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadRef = useRef(load);
  loadRef.current = load;

  const reload = useCallback(async () => {
    try {
      const data = await loadRef.current();
      setState({ key, data });
      setError(null);
    } catch (e) {
      setError(errorMessage(e, 'Não foi possível carregar os dados.'));
    } finally {
      setLoadedKey(key);
    }
  }, [key]);

  useFocusEffect(
    useCallback(() => {
      reload();
      const timer = setInterval(reload, intervalMs);
      return () => clearInterval(timer);
    }, [reload, intervalMs]),
  );

  return {
    data: state && state.key === key ? state.data : null,
    loading: loadedKey !== key,
    error,
    reload,
  };
}