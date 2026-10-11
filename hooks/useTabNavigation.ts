import { Href, useRouter } from 'expo-router';
import type { TabRoute } from '@/components/ui/BottomTabBar';

/**
 * Único lugar onde as abas da barra inferior são ligadas às rotas.
 * Para conectar uma aba nova, basta descomentar/ajustar a linha dela aqui.
 *
 * O caminho é o nome do arquivo em src/app/ (ex.: src/app/alertas.tsx -> '/alertas').
 */
const ROUTES: Partial<Record<TabRoute, string>> = {
  home: '/home',
  'meus-pets': '/meus-pets',
  alertas: '/alertas', // ajuste se o arquivo da tela de Alertas tiver outro nome
  relatorios: '/relatorios',
  config: '/config',
};

export function useTabNavigation() {
  const router = useRouter();

  return (route: TabRoute) => {
    const target = ROUTES[route];
    if (target) router.replace(target as Href);
    // abas sem rota definida ainda não fazem nada
  };
}
