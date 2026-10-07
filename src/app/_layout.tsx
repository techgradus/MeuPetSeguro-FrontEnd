import { useEffect, type ReactNode } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { WEB_PHONE } from '@/hooks/useResponsive';

// Mantém a tela nativa de abertura até as fontes carregarem.
SplashScreen.preventAutoHideAsync();

// Para voltar a ver o app em tela cheia no navegador, mude para false.
const SHOW_PHONE_FRAME_ON_WEB = true;

/** No navegador, mostra o app em uma moldura do tamanho de um celular. Em celular de verdade não faz nada. */
function WebPhoneFrame({ children }: { children: ReactNode }) {
  if (Platform.OS !== 'web' || !SHOW_PHONE_FRAME_ON_WEB) return <>{children}</>;
  return (
    <View style={styles.page}>
      <View style={styles.phone}>{children}</View>
    </View>
  );
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
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <WebPhoneFrame>
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />
    </WebPhoneFrame>
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
