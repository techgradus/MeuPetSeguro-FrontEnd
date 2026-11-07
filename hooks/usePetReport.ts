import { useActivityReport, useConsumptionReport, usePetInsight, usePetLatest } from '@/hooks/usePetLive';
import { buildPetReport, type PetReport } from '@/utils/petReport';
import { useMemo } from 'react';

/**
 * Dados da tela de Relatórios: atividade dos 7 dias, consumo dos potes, estado atual e insights da IA.
 * Cada fonte se atualiza sozinha enquanto a tela está em foco.
 */
export function usePetReport(pet: { id: string; name: string } | undefined): {
  report: PetReport;
  loading: boolean;
  error: string | null;
} {
  const petId = pet?.id;
  const name = pet?.name ?? '';

  const latest = usePetLatest(petId);
  const week = useActivityReport(petId, 'week');
  const food = useConsumptionReport(petId, 'food');
  const water = useConsumptionReport(petId, 'water');
  const insights = usePetInsight(petId);

  const report = useMemo(
    () =>
      buildPetReport({
        name,
        latest: latest.data,
        week: week.data,
        food: food.data,
        water: water.data,
        insights: insights.data,
      }),
    [name, latest.data, week.data, food.data, water.data, insights.data],
  );

  // Os insights da IA podem demorar; a tela já aparece com o que chegou das leituras.
  const loading = latest.loading || week.loading || food.loading || water.loading;
  const error = week.error ?? latest.error ?? food.error ?? water.error;

  return { report, loading, error };
}