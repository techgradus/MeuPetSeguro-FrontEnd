import type { DashboardPet } from '@/data/dashboardPets';
import { useActivityReport, usePetInsight, usePetLatest } from '@/hooks/usePetLive';
import { applyLive, toMiniBars, variationBadge } from '@/utils/petLive';
import { useMemo } from 'react';

/**
 * Pet da Home com os dados reais dos sensores aplicados, mais o mini gráfico e o selo de atividade.
 * Os dados se atualizam sozinhos enquanto a Home está aberta.
 */
export function useLivePet(base: DashboardPet | undefined) {
  const petId = base?.id;
  const latest = usePetLatest(petId);
  const insight = usePetInsight(petId);
  const today = useActivityReport(petId, 'today');
  const week = useActivityReport(petId, 'week');

  const pet = useMemo(
    () => (base ? applyLive(base, latest.data, insight.data) : undefined),
    [base, latest.data, insight.data],
  );
  const mini = useMemo(() => toMiniBars(week.data), [week.data]);
  const badge = useMemo(() => variationBadge(today.data), [today.data]);

  return { pet, bars: mini.bars, peakIndex: mini.peakIndex, badge, loading: latest.loading };
}