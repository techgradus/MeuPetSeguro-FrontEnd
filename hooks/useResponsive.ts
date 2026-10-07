import { Platform, useWindowDimensions } from 'react-native';

const BASE_WIDTH = 390; // largura de referência (iPhone 14 / maioria dos Androids)

// No navegador (localhost) o app é mostrado em uma "moldura" de celular
// (veja app/_layout.tsx). Por isso, na web, limitamos as medidas a esse tamanho.
export const WEB_PHONE = { width: 390, height: 844 };

/**
 * Ajuda a adaptar o layout a qualquer tela:
 * - ms(): escala moderada de fontes/tamanhos conforme a largura
 * - isSmallHeight: celulares baixos (ex.: iPhone SE, Androids compactos)
 * - isTablet: telas largas (tablet)
 */
export function useResponsive() {
  const dims = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const width = isWeb ? Math.min(dims.width, WEB_PHONE.width) : dims.width;
  const height = isWeb ? Math.min(dims.height, WEB_PHONE.height) : dims.height;
  const ratio = Math.min(Math.max(width / BASE_WIDTH, 0.85), 1.3);

  const ms = (size: number, factor = 0.5) =>
    Math.round(size + (size * ratio - size) * factor);

  return {
    width,
    height,
    isSmallHeight: height < 700,
    isTablet: width >= 600,
    contentMaxWidth: 460,
    ms,
  };
}
