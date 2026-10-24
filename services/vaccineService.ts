import { api, ApiError } from '@/services/api';
import type { NewVaccineInput, Vaccine, VaccineStatus } from '@/types/vaccine';
import { todayIso } from '@/utils/dateFormat';


type ApiVaccine = {
  id: string;
  petId: string;
  name: string;
  appliedAt: string;
  nextDoseAt: string | null;
  notes: string | null;
};

const DUE_SOON_DAYS = 7;

const dateOnly = (iso: string) => iso.slice(0, 10);

function daysBetween(fromIso: string, toIso: string): number {
  const [fy, fm, fd] = fromIso.split('-').map(Number);
  const [ty, tm, td] = toIso.split('-').map(Number);
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / 86400000);
}

function statusOf(v: ApiVaccine, all: ApiVaccine[], today: string): VaccineStatus {
  if (!v.nextDoseAt) return 'Em dia';

  const name = v.name.trim().toLowerCase();
  const superseded = all.some(
    (o) => o.id !== v.id && o.name.trim().toLowerCase() === name && o.appliedAt > v.appliedAt,
  );
  if (superseded) return 'Em dia';

  const days = daysBetween(today, dateOnly(v.nextDoseAt));
  if (days < 0) return 'Atrasada';
  if (days <= DUE_SOON_DAYS) return 'Próxima do vencimento';
  return 'Em dia';
}

function fromApi(v: ApiVaccine, all: ApiVaccine[], today: string): Vaccine {
  return {
    id: v.id,
    petId: v.petId,
    name: v.name,
    appliedAt: dateOnly(v.appliedAt),
    nextDoseAt: v.nextDoseAt ? dateOnly(v.nextDoseAt) : undefined,
    status: statusOf(v, all, today),
    notes: v.notes || undefined,
  };
}

export const vaccineService = {
  async list(petId: string): Promise<Vaccine[]> {
    const list = await api<ApiVaccine[]>(`/pets/${petId}/vaccines`, { auth: true });
    const today = todayIso();
    return list.map((v) => fromApi(v, list, today));
  },

  async get(id: string): Promise<Vaccine | undefined> {
    try {
      const vaccine = await api<ApiVaccine>(`/vaccines/${id}`, { auth: true });
      const all = await api<ApiVaccine[]>(`/pets/${vaccine.petId}/vaccines`, { auth: true });
      return fromApi(vaccine, all, todayIso());
    } catch (e) {
      if (e instanceof ApiError && (e.status === 404 || e.status === 403)) return undefined;
      throw e;
    }
  },

  async add(petId: string, input: NewVaccineInput): Promise<Vaccine> {
    const vaccine = await api<ApiVaccine>(`/pets/${petId}/vaccines`, {
      method: 'POST',
      body: {
        name: input.name,
        appliedAt: input.appliedAt,
        nextDoseAt: input.nextDoseAt,
        notes: input.notes,
      },
      auth: true,
    });
    return fromApi(vaccine, [vaccine], todayIso());
  },

  async update(id: string, input: NewVaccineInput): Promise<void> {
    await api(`/vaccines/${id}`, {
      method: 'PUT',
      body: {
        name: input.name,
        appliedAt: input.appliedAt,
        nextDoseAt: input.nextDoseAt ?? null, // null apaga a próxima dose
        notes: input.notes ?? '',
      },
      auth: true,
    });
  },

  async remove(id: string): Promise<void> {
    await api(`/vaccines/${id}`, { method: 'DELETE', auth: true });
  },

  /** Resumo para o cartão "Carteira de Vacinação" de Meus pets. */
  summarize(list: Vaccine[]) {
    const upToDate = list.filter((v) => v.status === 'Em dia').length;
    return { upToDate, pending: list.length - upToDate };
  },
};
