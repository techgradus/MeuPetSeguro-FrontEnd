import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Logo } from '@/components/ui/Logo';
import { useResponsive } from '@/hooks/useResponsive';
import { colors, fonts } from '@/constants/petTheme';

const HOLD_AFTER_ANIMATION = 800; // tempo parado antes de ir para a Home

/** Splash exibida APÓS o login, enquanto a Home carrega. */
export default function SplashScreen() {
  const router = useRouter();
  const { width, ms } = useResponsive();

  // Logo: aparece pequeno e dá "zoom" até o tamanho final
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.4)).current;
  // Nome e slogan: surgem em sequência, subindo suavemente
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(14)).current;
  const sloganOpacity = useRef(new Animated.Value(0)).current;
  const sloganY = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const reveal = (opacity: Animated.Value, y: Animated.Value) =>
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(y, { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]);

    const animation = Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 1000,
          easing: Easing.out(Easing.back(1.6)),
          useNativeDriver: true,
        }),
      ]),
      reveal(titleOpacity, titleY),
      reveal(sloganOpacity, sloganY),
    ]);

    animation.start(({ finished }) => {
      if (finished) {
        // TODO: quando houver back-end, aguardar aqui o carregamento real dos dados.
        timer = setTimeout(() => router.replace('/home'), HOLD_AFTER_ANIMATION);
      }
    });

    return () => {
      animation.stop();
      clearTimeout(timer);
    };
  }, [router, logoOpacity, logoScale, titleOpacity, titleY, sloganOpacity, sloganY]);

  return (
    <ScreenContainer scroll={false}>
      <Animated.View style={styles.center}>
        <Animated.View style={{ opacity: logoOpacity, transform: [{ scale: logoScale }] }}>
          <Logo size={Math.min(width * 0.6, 280)} />
        </Animated.View>

        <Animated.Text
          style={[styles.title, { fontSize: ms(30), opacity: titleOpacity, transform: [{ translateY: titleY }] }]}
        >
          Meu Pet Seguro
        </Animated.Text>

        <Animated.Text
          style={[styles.slogan, { fontSize: ms(15), opacity: sloganOpacity, transform: [{ translateY: sloganY }] }]}
        >
          Cuidado que você acompanha de perto
        </Animated.Text>
      </Animated.View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.extrabold, color: colors.text, textAlign: 'center', marginTop: 12 },
  slogan: { fontFamily: fonts.medium, color: colors.textMuted, textAlign: 'center', marginTop: 6 },
});
