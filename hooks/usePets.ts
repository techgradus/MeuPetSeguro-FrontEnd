import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { errorMessage } from '@/services/api';
import { petService } from '@/services/petService';
import type { Pet } from '@/types/pet';

let cache: Pet[] | null = null;
let generation = 0;

export function clearPetsCache() {
  cache = null;
  generation += 1;
}

export function usePets() {
  const [pets, setPets] = useState<Pet[]>(cache ?? []);
  const [loading, setLoading] = useState(cache === null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const startedAt = generation;
    try {
      const list = await petService.list();
      if (startedAt === generation) cache = list; // ignora resposta de uma sessão já encerrada
      setPets(list);
      setError(null);
    } catch (e) {
      setError(errorMessage(e, 'Não foi possível carregar seus pets.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  return { pets, loading, error, reload };
}