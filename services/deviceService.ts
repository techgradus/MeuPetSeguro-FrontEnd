import { DeviceType } from '@/constants/deviceTypes';

/**
 * Camada de dispositivos (MOCK).
 * Ao integrar o hardware (ESP32 / MQTT), troque o corpo destas funções.
 */
export type WifiNetwork = { ssid: string; signal: 'Sinal excelente' | 'Sinal bom' | 'Sinal fraco' };

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
};
