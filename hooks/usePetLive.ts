import { useLiveData } from '@/hooks/useLiveData';
import { insightService, PetInsights } from '@/services/insightService';
import {
    ActivityReport,
    BowlKind,
    ConsumptionReport,
    Period,
    PetLatest,
    readingService,
} from '@/services/readingService';
import { useCallback } from 'react';

const none = async () => null;

/** Estado atual do pet (atividade e nível dos potes). Atualiza a cada 30 s. */
export function usePetLatest(petId?: string) {
  const load = useCallback(() => (petId ? readingService.latest(petId) : none()), [petId]);
  return useLiveData<PetLatest | null>(`latest:${petId}`, load, 30_000);
}

/** Insights da IA. A análise é mais pesada: atualiza a cada 5 min. */
export function usePetInsight(petId?: string) {
  const load = useCallback(() => (petId ? insightService.get(petId) : none()), [petId]);
  return useLiveData<PetInsights | null>(`insight:${petId}`, load, 300_000);
}

/** Relatório de atividade do período (hoje ou 7 dias). Atualiza a cada minuto. */
export function useActivityReport(petId: string | undefined, period: Period) {
  const load = useCallback(() => (petId ? readingService.activity(petId, period) : none()), [petId, period]);
  return useLiveData<ActivityReport | null>(`activity:${petId}:${period}`, load, 60_000);
}

/** Consumo de comida ou água nos últimos 7 dias. Atualiza a cada minuto. */
export function useConsumptionReport(petId: string | undefined, kind: BowlKind) {
  const load = useCallback(() => (petId ? readingService.consumption(petId, kind) : none()), [petId, kind]);
  return useLiveData<ConsumptionReport | null>(`consumption:${petId}:${kind}`, load, 60_000);
}