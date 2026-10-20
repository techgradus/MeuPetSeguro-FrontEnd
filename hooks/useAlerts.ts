import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import type { PetAlert } from '@/data/alerts';
import { alertService } from '@/services/alertService';
import { errorMessage } from '@/services/api';

let cache: PetAlert[] | null = null;
let generation = 0;

export function clearAlertsCache() {
  cache = null;
  generation += 1;
}

export function useAlerts() {
  const [alerts, setAlerts] = useState<PetAlert[]>(cache ?? []);
  const [loading, setLoading] = useState(cache === null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const startedAt = generation;
    try {
      const list = await alertService.list();
      if (startedAt === generation) cache = list;
      setAlerts(list);
      setError(null);
    } catch (e) {
      setError(errorMessage(e, 'Não foi possível carregar os alertas.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  const update = (fn: (list: PetAlert[]) => PetAlert[]) => {
    setAlerts((current) => {
      const next = fn(current);
      cache = next;
      return next;
    });
  };

  const markAsRead = useCallback(async (id: string) => {
    update((list) => list.map((a) => (a.id === id ? { ...a, read: true } : a)));
    try {
      await alertService.markAsRead(id);
    } catch {
      reload(); // não conseguiu salvar: volta ao estado real do servidor
    }
  }, [reload]);

  const markAllAsRead = useCallback(async (petId?: string) => {
    update((list) => list.map((a) => (!petId || a.petId === petId ? { ...a, read: true } : a)));
    try {
      await alertService.markAllAsRead(petId);
    } catch {
      reload();
    }
  }, [reload]);

  const unreadCount = alerts.filter((a) => !a.read).length;

  return { alerts, unreadCount, loading, error, reload, markAsRead, markAllAsRead };
}