import { useEffect, type ReactNode } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Stack, useRootNavigationState, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { WEB_PHONE } from '@/hooks/useResponsive';
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';

import { useAppTheme } from '@/hooks/useAppTheme';

// Mantém a tela nativa de abertura até as fontes carregarem.
SplashScreen.preventAutoHideAsync();

// Para voltar a ver o app em tela cheia no navegador, mude para false.
const SHOW_PHONE_FRAME_ON_WEB = true;

// Telas que podem ser abertas SEM estar logado. Qualquer outra rota exige login.
const PUBLIC_ROUTES = ['login', 'forgot-password'];

/** No navegador, mostra o app em uma moldura do tamanho de um celular. Em celular de verdade não faz nada. */
function WebPhoneFrame({ children }: { children: ReactNode }) {
  const { dark } = useAppTheme();
  if (Platform.OS !== 'web' || !SHOW_PHONE_FRAME_ON_WEB) return <>{children}</>;
  return (
    <View style={[styles.page, dark && { backgroundColor: '#081212' }]}>
      <View style={[styles.phone, dark && { backgroundColor: '#0E1A1A', borderColor: '#263D3D' }]}>{children}</View>
    </View>
  );
}

function AppStack() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments() as string[];
  const navigationState = useRootNavigationState();

  const first = segments[0];
  const isPublic = !first || first === 'index' || PUBLIC_ROUTES.includes(first);

  // Esconde a splash nativa quando a sessão já foi lida.
  useEffect(() => {
    if (!isLoading) SplashScreen.hideAsync();
  }, [isLoading]);

  // Deslogado (logout ou token expirado) em tela privada, volta para o login.
  useEffect(() => {
    if (isLoading || !navigationState?.key) return;
    if (!user && !isPublic) router.replace('/login');
  }, [isLoading, navigationState?.key, user, isPublic, router]);

  if (isLoading) return null;

  return <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />;
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  useEffect(() => {
    if (error) console.warn('Erro ao carregar as fontes:', error);
  }, [error]);

  if (!loaded && !error) return null;

  return (
    <AuthProvider>
      <WebPhoneFrame>
        <AppStack />
      </WebPhoneFrame>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#DCEBE9' },
  phone: {
    width: '100%',
    maxWidth: WEB_PHONE.width,
    height: '100%',
    maxHeight: WEB_PHONE.height,
    overflow: 'hidden',
    borderRadius: 32,
    borderWidth: 6,
    borderColor: '#0F2B2B',
    backgroundColor: '#F3FAF9',
  },
});