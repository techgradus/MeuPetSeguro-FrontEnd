import { DeviceType } from '@/constants/deviceTypes';
import { api } from '@/services/api';
import type { PetDevice } from '@/types/device';

/**
 * Camada de dispositivos.
 * - register / remove / waitUntilOnline: back-end real (/api/pets/:petId/devices).
 * - scanNetworks / connect (Wi-Fi do aparelho): ainda MOCK. Ao integrar o hardware (ESP32),
 *   troque o corpo destas duas funções.
 */
export type WifiNetwork = { ssid: string; signal: 'Sinal excelente' | 'Sinal bom' | 'Sinal fraco' };

export type ApiDevice = {
  id: string;
  type: 'COLLAR' | 'FOOD_BOWL' | 'WATER_BOWL';
  deviceCode: string;
  status: 'ONLINE' | 'OFFLINE';
  batteryLevel: number | null;
  lastSyncAt: string | null;
};

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

const fakeDelay = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));

export const deviceService = {
  async scanNetworks(): Promise<WifiNetwork[]> {
    // TODO: obter as redes Wi-Fi vistas pelo dispositivo
    await fakeDelay(500);
    return [
      { ssid: 'Casa_Arthur_5G', signal: 'Sinal excelente' },
      { ssid: 'Casa_arthur', signal: 'Sinal bom' },
      { ssid: 'Meu_pet_visitantes', signal: 'Sinal bom' },
    ];
  },

  async connect(_type: DeviceType, _ssid: string, _password: string): Promise<void> {
    // TODO: enviar as credenciais Wi-Fi ao dispositivo e aguardar a conexão
    await fakeDelay(3800);
  },

  async register(petId: string, type: DeviceType, deviceCode: string): Promise<PetDevice> {
    const device = await api<ApiDevice>(`/pets/${petId}/devices`, {
      method: 'POST',
      body: { type: TO_API[type], deviceCode: deviceCode.trim() },
      auth: true,
    });
    return deviceFromApi(device);
  },

  /**
   * Espera o dispositivo ficar ONLINE no back-end (ele avisa pelo MQTT quando liga).
   * Hoje quem "liga" o dispositivo é o simulador (npm run mqtt:simulate); com o hardware real
   * será o próprio aparelho, e este código continua igual. Devolve false se o tempo esgotar.
   */
  async waitUntilOnline(
    petId: string,
    deviceId: string,
    options: { timeoutMs?: number; intervalMs?: number; shouldStop?: () => boolean } = {},
  ): Promise<boolean> {
    const { timeoutMs = 30000, intervalMs = 2000, shouldStop } = options;
    const deadline = Date.now() + timeoutMs;

    while (Date.now() < deadline && !shouldStop?.()) {
      const device = await api<ApiDevice>(`/pets/${petId}/devices/${deviceId}`, { auth: true });
      if (device.status === 'ONLINE') return true;
      await fakeDelay(intervalMs);
    }
    return false;
  },

  async remove(petId: string, deviceId: string): Promise<void> {
    await api(`/pets/${petId}/devices/${deviceId}`, { method: 'DELETE', auth: true });
  },
};