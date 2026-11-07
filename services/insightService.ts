import { api, ApiError } from '@/services/api';

/** Insights gerados pela IA (back-end: GET /api/pets/:petId/insights). */
export type Insight = {
  type: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  data?: Record<string, unknown>;
};

export type PetInsights = {
  petId: string;
  modelVersion: string;
  /** "synthetic" (treinado com dados de exemplo) ou "real" (treinado com leituras do próprio app). */
  modelSource: string;
  insights: Insight[];
};

export const insightService = {
  /**
   * Devolve null quando a IA está indisponível (503) ou o pet ainda não tem dispositivos/leituras
   * suficientes para analisar (422). Os demais erros sobem normalmente.
   */
  async get(petId: string): Promise<PetInsights | null> {
    try {
      return await api<PetInsights>(`/pets/${petId}/insights`, { auth: true });
    } catch (e) {
      if (e instanceof ApiError && (e.status === 503 || e.status === 422)) return null;
      throw e;
    }
  },
};