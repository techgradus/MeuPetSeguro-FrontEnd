import { alertService } from '@/services/alertService';
import { api } from '@/services/api';

jest.mock('@/services/api', () => ({ api: jest.fn() }));
const mockedApi = api as jest.MockedFunction<typeof api>;

beforeEach(() => mockedApi.mockReset());

const apiAlert = (type: string, message = 'msg') => ({
  id: `id-${type}`,
  type,
  message,
  read: false,
  createdAt: new Date().toISOString(),
  petId: 'pet-1',
});

describe('alertService.list', () => {
  it('converte cada tipo do back-end no tipo/título da tela', async () => {
    mockedApi.mockResolvedValueOnce([
      apiAlert('LOW_FOOD'),
      apiAlert('LOW_WATER'),
      apiAlert('INACTIVITY'),
      apiAlert('ACTIVITY_ANOMALY'),
      apiAlert('DEVICE_OFFLINE'),
      apiAlert('VACCINE_DUE', 'A vacina V10 de Rex está atrasada desde 10/10/2026'),
      apiAlert('VACCINE_DUE', 'A vacina V10 de Rex vence em 3 dia(s)'),
    ]);

    const alerts = await alertService.list();

    expect(alerts.map((a) => [a.kind, a.title])).toEqual([
      ['food', 'Nível de comida baixo'],
      ['water', 'Nível de água baixo'],
      ['activity', 'Pouca atividade'],
      ['pattern', 'Mudança no padrão'],
      ['device', 'Dispositivo desconectado'],
      ['vaccine-late', 'Vacina atrasada'],
      ['vaccine-soon', 'Próxima dose em breve'],
    ]);
    expect(alerts[0]).toMatchObject({ id: 'id-LOW_FOOD', petId: 'pet-1', read: false, time: 'Agora' });
  });
});

describe('alertService.markAllAsRead', () => {
  it('filtra por pet quando informado', async () => {
    mockedApi.mockResolvedValue(undefined);

    await alertService.markAllAsRead('pet 1');
    await alertService.markAllAsRead();

    expect(mockedApi).toHaveBeenNthCalledWith(1, '/alerts/read-all?petId=pet%201', { method: 'PATCH', auth: true });
    expect(mockedApi).toHaveBeenNthCalledWith(2, '/alerts/read-all', { method: 'PATCH', auth: true });
  });
});
