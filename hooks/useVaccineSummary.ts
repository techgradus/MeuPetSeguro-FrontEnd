import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { vaccineService } from '@/services/vaccineService';

/** Quantas vacinas do pet estão em dia / pendentes (recarrega quando a tela ganha foco). */
export function useVaccineSummary(petId?: string) {
  const [summary, setSummary] = useState<{ upToDate: number; pending: number } | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!petId) {
        setSummary(null);
        return;
      }
      let active = true;
      vaccineService
        .list(petId)
        .then((list) => {
          if (active) setSummary(vaccineService.summarize(list));
        })
        .catch(() => {});
      return () => {
        active = false;
      };
    }, [petId]),
  );

  return summary;
}