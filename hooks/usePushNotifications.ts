import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useAuth } from '@/hooks/useAuth';
import { listenForTokenRefresh, registerForPush } from '@/services/pushService';

// Com o app aberto, mostra a notificação em vez de engolir em silêncio.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * @param ready true quando a sessão já foi lida e a navegação já está montada
 */
export function usePushNotifications(ready: boolean) {
  const { user } = useAuth();
  const router = useRouter();
  const handledId = useRef<string | null>(null);

  // Logou -> registra o aparelho. Também escuta troca de token.
  useEffect(() => {
    if (!user) return;
    registerForPush();
    return listenForTokenRefresh();
  }, [user?.id]);

  // Toque na notificação (app aberto, em segundo plano ou fechado) -> tela de alertas.
  const lastResponse = Notifications.useLastNotificationResponse();
  useEffect(() => {
    if (!ready || !user || !lastResponse) return;
    if (lastResponse.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return;

    const id = lastResponse.notification.request.identifier;
    if (handledId.current === id) return;
    handledId.current = id;

    router.push('/alertas');
  }, [ready, user, lastResponse, router]);
}
