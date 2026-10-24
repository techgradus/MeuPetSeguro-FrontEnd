import type { AlertKind, PetAlert } from '@/data/alerts';
import { api } from '@/services/api';
import { formatAlertTime } from '@/utils/formatAlertTime';

type ApiAlertType =
  | 'LOW_FOOD'
  | 'LOW_WATER'
  | 'INACTIVITY'
  | 'ACTIVITY_ANOMALY'
  | 'DEVICE_OFFLINE'
  | 'VACCINE_DUE';

type ApiAlert = {
  id: string;
  type: ApiAlertType;
  message: string;
  read: boolean;
  createdAt: string;
  petId: string;
};

const TITLES: Record<AlertKind, string> = {
  'vaccine-late': 'Vacina atrasada',
  'vaccine-soon': 'Próxima dose em breve',
  food: 'Nível de comida baixo',
  water: 'Nível de água baixo',
  pattern: 'Mudança no padrão',
  device: 'Dispositivo desconectado',
  activity: 'Pouca atividade',
};

function kindOf(alert: ApiAlert): AlertKind {
  switch (alert.type) {
    case 'LOW_FOOD': return 'food';
    case 'LOW_WATER': return 'water';
    case 'INACTIVITY': return 'activity';
    case 'ACTIVITY_ANOMALY': return 'pattern';
    case 'DEVICE_OFFLINE': return 'device';
    case 'VACCINE_DUE':
      // O back-end escreve "está atrasada" na mensagem quando a dose já venceu
      return /atrasad/i.test(alert.message) ? 'vaccine-late' : 'vaccine-soon';
  }
}

function fromApi(a: ApiAlert): PetAlert {
  const kind = kindOf(a);
  return {
    id: a.id,
    petId: a.petId,
    kind,
    title: TITLES[kind],
    description: a.message,
    time: formatAlertTime(a.createdAt),
    read: a.read,
  };
}

export const alertService = {
  async list(): Promise<PetAlert[]> {
    const alerts = await api<ApiAlert[]>('/alerts', { auth: true });
    return alerts.map(fromApi);
  },

  async markAsRead(id: string): Promise<void> {
    await api(`/alerts/${id}/read`, { method: 'PATCH', auth: true });
  },

  async markAllAsRead(petId?: string): Promise<void> {
    const query = petId ? `?petId=${encodeURIComponent(petId)}` : '';
    await api(`/alerts/read-all${query}`, { method: 'PATCH', auth: true });
  },
};