import { api } from '@/services/api';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Precisa ser o mesmo "channelId" que o back-end usa em push.service.ts
export const ALERTS_CHANNEL_ID = 'alerts';

let currentToken: string | null = null;

async function sendTokenToServer(token: string) {
  await api('/push-tokens', { method: 'POST', body: { token, platform: 'android' }, auth: true });
  currentToken = token;
}

export async function registerForPush(): Promise<string | null> {
  if (Platform.OS !== 'android') return null;

  try {
    // Em Android 13+ o canal precisa existir ANTES de pedir a permissão
    await Notifications.setNotificationChannelAsync(ALERTS_CHANNEL_ID, {
      name: 'Alertas do pet',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1F9D8F',
    });

    let { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      ({ status } = await Notifications.requestPermissionsAsync());
    }
    if (status !== 'granted') return null;

    const { data } = await Notifications.getDevicePushTokenAsync();
    const token = String(data);

    await sendTokenToServer(token);
    return token;
  } catch (e) {
    console.warn('Não foi possível registrar o push:', e);
    return null;
  }
}

export function listenForTokenRefresh() {
  const sub = Notifications.addPushTokenListener((t) => {
    sendTokenToServer(String(t.data)).catch(() => {});
  });
  return () => sub.remove();
}

/** Chamado no logout: este aparelho deixa de receber os alertas dessa conta. */
export async function unregisterPush(): Promise<void> {
  if (Platform.OS !== 'android' || !currentToken) return;
  const token = currentToken;
  currentToken = null;
  await api('/push-tokens', { method: 'DELETE', body: { token }, auth: true });
}
