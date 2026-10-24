import { useMemo } from 'react';
import { toDashboardPet } from '@/data/dashboardPets';
import { usePets } from '@/hooks/usePets';

/** Pets reais (back-end) já no formato das telas Início, Atividade e Alimentação. */
export function useDashboardPets() {
  const { pets, loading, error, reload } = usePets();
  const dashboardPets = useMemo(() => pets.map(toDashboardPet), [pets]);
  const devices = useMemo(() => pets.flatMap((p) => p.devices), [pets]);
  return { pets: dashboardPets, devices, loading, error, reload };
}