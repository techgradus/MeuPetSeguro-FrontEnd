import { NewVaccineInput, Vaccine } from '@/types/vaccine';

/**
 * Camada de dados da carteira de vacinação (MOCK, em memória).
 * Ao integrar o back-end, troque o corpo destas funções por chamadas à API.
 */
const STORE: Record<string, Vaccine[]> = {
  rex: [
    { id: 'v-rex-1', petId: 'rex', name: 'V10 (múltipla)', appliedAt: '2026-03-10', nextDoseAt: '2027-03-10', status: 'Em dia' },
    { id: 'v-rex-2', petId: 'rex', name: 'Antirrábica', appliedAt: '2026-01-15', nextDoseAt: '2027-01-15', status: 'Em dia' },
    { id: 'v-rex-3', petId: 'rex', name: 'Giárdia', appliedAt: '2025-10-25', nextDoseAt: '2026-10-25', status: 'Próxima do vencimento' },
    { id: 'v-rex-4', petId: 'rex', name: 'Leishmaniose', appliedAt: '2025-09-01', nextDoseAt: '2026-09-01', status: 'Atrasada' },
  ],
  mia: [
    { id: 'v-mia-1', petId: 'mia', name: 'V4 Felina', appliedAt: '2026-05-18', nextDoseAt: '2027-05-18', status: 'Em dia' },
    { id: 'v-mia-2', petId: 'mia', name: 'Antirrábica', appliedAt: '2026-01-22', nextDoseAt: '2027-01-22', status: 'Em dia' },
    { id: 'v-mia-3', petId: 'mia', name: 'Leucemia Felina', appliedAt: '2025-09-29', nextDoseAt: '2026-09-29', status: 'Próxima do vencimento' },
  ],
};

const fakeDelay = (ms = 500) => new Promise<void>((res) => setTimeout(res, ms));

const sortRecentFirst = (list: Vaccine[]) =>
  [...list].sort((a, b) => b.appliedAt.localeCompare(a.appliedAt));

export const vaccineService = {
  async list(petId: string): Promise<Vaccine[]> {
    // TODO: GET /pets/:id/vaccines
    return sortRecentFirst(STORE[petId] ?? []);
  },

  async get(id: string): Promise<Vaccine | undefined> {
    // TODO: GET /vaccines/:id
    return Object.values(STORE).flat().find((v) => v.id === id);
  },

  async update(id: string, input: NewVaccineInput): Promise<void> {
    // TODO: PUT /vaccines/:id
    await fakeDelay();
    for (const petId of Object.keys(STORE)) {
      const index = STORE[petId].findIndex((v) => v.id === id);
      if (index >= 0) {
        STORE[petId][index] = { ...STORE[petId][index], ...input };
        return;
      }
    }
  },

  async remove(id: string): Promise<void> {
    // TODO: DELETE /vaccines/:id
    await fakeDelay(300);
    for (const petId of Object.keys(STORE)) {
      STORE[petId] = STORE[petId].filter((v) => v.id !== id);
    }
  },

  async add(petId: string, input: NewVaccineInput): Promise<Vaccine> {
    // TODO: POST /pets/:id/vaccines
    await fakeDelay();
    const vaccine: Vaccine = { id: `v-${Date.now()}`, petId, ...input };
    STORE[petId] = [...(STORE[petId] ?? []), vaccine];
    return vaccine;
  },

  /**
   * Resumo para o cartão "Carteira de Vacinação" de Meus Pets.
   * Se o pet ainda não tem registros, usa os valores informados em `fallback`.
   */
  summary(petId: string, fallback: { upToDate: number; pending: number }) {
    const list = STORE[petId];
    if (!list) return fallback;
    const upToDate = list.filter((v) => v.status === 'Em dia').length;
    return { upToDate, pending: list.length - upToDate };
  },
};
