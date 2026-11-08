import type { SetupKind } from '@/constants/deviceSetup';
import { DeviceType } from '@/constants/deviceTypes';
import { api } from '@/services/api';
import type { PetDevice } from '@/types/device';

/**
 * Camada de dispositivos (back-end real, /api/pets/:petId/devices).
 *
 * O Wi-Fi do dispositivo NÃO passa pelo app: o próprio aparelho abre uma rede (MEUPET-<ID>) com uma
 * página de configuração, onde a pessoa escolhe a rede da casa e digita a senha. Depois disso ele
 * conecta no broker MQTT e o back-end o marca como ONLINE (é isso que o app espera).
 */
export type ApiDevice = {
  id: string;
  type: 'COLLAR' | 'FOOD_BOWL' | 'WATER_BOWL';
  deviceCode: string;
  status: 'ONLINE' | 'OFFLINE';
  batteryLevel: number | null;
  lastSyncAt: string | null;
};

type ApiStation = { stationCode: string; devices: ApiDevice[] };

const TO_API: Record<DeviceType, ApiDevice['type']> = {
  colar: 'COLLAR',
  comida: 'FOOD_BOWL',
  agua: 'WATER_BOWL',
};

const FROM_API: Record<ApiDevice['type'], DeviceType> = {
  COLLAR: 'colar',
  FOOD_BOWL: 'comida',
  WATER_BOWL: 'agua',
};

export function deviceFromApi(d: ApiDevice): PetDevice {
  return {
    id: d.id,
    type: FROM_API[d.type] ?? 'colar',
    code: d.deviceCode,
    online: d.status === 'ONLINE',
    battery: d.batteryLevel,
    lastSyncAt: d.lastSyncAt,
  };
}

const sleep = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));

export const deviceService = {
  /** Vincula um dispositivo avulso (ex.: colar) ao pet. */
  async register(petId: string, type: DeviceType, deviceCode: string): Promise<PetDevice> {
    const device = await api<ApiDevice>(`/pets/${petId}/devices`, {
      method: 'POST',
      body: { type: TO_API[type], deviceCode: deviceCode.trim() },
      auth: true,
    });
    return deviceFromApi(device);
  },

  /**
   * Vincula o equipamento escolhido no assistente. A estação de potes vira dois dispositivos
   * (comida e água) criados juntos no servidor: ou entram os dois ou nenhum.
   */
  async registerSetup(petId: string, kind: SetupKind, code: string): Promise<PetDevice[]> {
    if (kind === 'colar') return [await deviceService.register(petId, 'colar', code)];

    const station = await api<ApiStation>(`/pets/${petId}/devices/station`, {
      method: 'POST',
      body: { stationCode: code.trim() },
      auth: true,
    });
    return station.devices.map(deviceFromApi);
  },

  /**
   * Espera TODOS os dispositivos ficarem ONLINE no back-end (eles avisam pelo MQTT quando ligam).
   * Hoje quem "liga" é o simulador (npm run mqtt:simulate); com o hardware real será o próprio aparelho
   * e este código continua igual. Devolve false se o tempo esgotar.
   */
  async waitUntilOnline(
    petId: string,
    deviceIds: string[],
    options: { timeoutMs?: number; intervalMs?: number; shouldStop?: () => boolean } = {},
  ): Promise<boolean> {
    const { timeoutMs = 60000, intervalMs = 2000, shouldStop } = options;
    const deadline = Date.now() + timeoutMs;

    while (Date.now() < deadline && !shouldStop?.()) {
      const devices = await api<ApiDevice[]>(`/pets/${petId}/devices`, { auth: true });
      const allOnline = deviceIds.every((id) => devices.some((d) => d.id === id && d.status === 'ONLINE'));
      if (allOnline) return true;
      await sleep(intervalMs);
    }
    return false;
  },

  async remove(petId: string, deviceId: string): Promise<void> {
    await api(`/pets/${petId}/devices/${deviceId}`, { method: 'DELETE', auth: true });
  },
};