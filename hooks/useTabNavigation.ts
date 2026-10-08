import { useRouter } from 'expo-router';
import type { TabRoute } from '@/components/ui/BottomTabBar';

/**
 * Único lugar onde as abas da barra inferior são ligadas às rotas.
 * Para conectar uma aba nova, basta incluir um case aqui.
 */
export function useTabNavigation() {
  const router = useRouter();

  return (route: TabRoute) => {
    switch (route) {
      case 'home':
        router.replace('/home');
        break;
      case 'meus-pets':
        router.replace('/meus-pets');
        break;
      // TODO: conectar quando as telas existirem
      case 'alertas':
      case 'relatorios':
      case 'config':
        break;
    }
  };
}
