import { Platform, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
 
/* ============================================================
   LAYOUT RESPONSIVO (compartilhado entre todas as telas)
 
   Tudo é desenhado para uma tela de 390px de largura e
   escalado a partir da largura real disponível:
 
   - Web: moldura de celular com no máximo 390px.
   - Mobile (iOS/Android): ocupa a tela inteira, respeitando
     a área segura (notch e barra inferior).
   - Tablet: o conteúdo fica centralizado, com largura máxima.
 
   Uso: const { s } = useLayout();  →  fontSize: s(14)
============================================================ */
 
export const DESIGN_WIDTH = 390;
export const WEB_FRAME_BORDER = 6;
export const MAX_CONTENT_WIDTH = 520;
 
export function useLayout() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';
 
  const frameWidth = isWeb ? Math.min(DESIGN_WIDTH, width - 32) : width;
  const frameHeight = isWeb ? Math.min(844, height - 40) : height;
  const screenWidth = isWeb ? frameWidth - WEB_FRAME_BORDER * 2 : frameWidth;
 
  // Entre 0.85 (celulares pequenos) e 1.15 (tablets)
  const scale = Math.min(
    Math.max(Math.min(screenWidth, MAX_CONTENT_WIDTH) / DESIGN_WIDTH, 0.85),
    1.15,
  );
 
  const s = (size: number) => Math.round(size * scale * 2) / 2;
 
  const insetBottom = isWeb ? 0 : insets.bottom;
 
  return {
    s,
    isWeb,
    frameWidth,
    frameHeight,
    insetTop: isWeb ? 0 : insets.top,
    insetBottom,
    // altura da tab bar (as telas usam para o espaço no fim do scroll)
    navHeight: s(70) + insetBottom,
  };
}
 
export type Layout = ReturnType<typeof useLayout>;
 