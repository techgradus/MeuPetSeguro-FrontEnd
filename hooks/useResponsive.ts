import { useWindowDimensions } from 'react-native';

const BASE_WIDTH = 390; // largura de referência (iPhone 14 / maioria dos Androids)

/**
 * Ajuda a adaptar o layout a qualquer tela:
 * - ms(): escala moderada de fontes/tamanhos conforme a largura
 * - isSmallHeight: celulares baixos (ex.: iPhone SE, Androids compactos)
 * - isTablet: telas largas (tablet / web)
 */
export function useResponsive() {
  const { width, height } = useWindowDimensions();
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
