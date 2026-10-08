import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import BottomNav, { TabId } from '@/components/BottomNav';
import { ui } from '@/constants/ui';
import { Layout, useLayout, WEB_FRAME_BORDER } from '@/hooks/useLayout';

type Props = {
  /** Aba da tab bar que fica destacada nesta tela. */
  active: TabId;
  children: React.ReactNode;
};

/**
 * Moldura usada por todas as telas.
 *
 * Web: o app aparece dentro de um celular centralizado.
 * Mobile: ocupa a tela inteira.
 * A tab bar já vem incluída.
 */
export default function PhoneFrame({ active, children }: Props) {
  const layout = useLayout();

  const styles = useMemo(
    () => makeStyles(layout),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [layout.frameWidth, layout.frameHeight, layout.isWeb],
  );

  return (
    <View style={styles.browserBackground}>
      <View style={styles.phone}>
        {layout.isWeb && (
          <View style={styles.phoneTop}>
            <View style={styles.camera} />
          </View>
        )}

        <View style={styles.screen}>
          {children}

          <BottomNav active={active} />
        </View>
      </View>
    </View>
  );
}

function makeStyles({ isWeb, frameWidth, frameHeight }: Layout) {
  return StyleSheet.create({
    browserBackground: {
      flex: 1,
      backgroundColor: isWeb ? '#E9F3F2' : ui.screenBackground,
      alignItems: 'center',
      justifyContent: 'center',
    },

    phone: {
      width: frameWidth,
      height: frameHeight,
      backgroundColor: isWeb ? '#263D3D' : ui.screenBackground,
      borderRadius: isWeb ? 42 : 0,
      padding: isWeb ? WEB_FRAME_BORDER : 0,

      ...(isWeb
        ? {
            shadowColor: '#193333',
            shadowOpacity: 0.25,
            shadowRadius: 25,
            shadowOffset: { width: 0, height: 12 },
          }
        : {}),
    },

    phoneTop: {
      height: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#263D3D',
    },

    camera: {
      width: 45,
      height: 5,
      borderRadius: 10,
      backgroundColor: '#162A2A',
    },

    screen: {
      flex: 1,
      overflow: 'hidden',
      backgroundColor: ui.screenBackground,
      borderRadius: isWeb ? 36 : 0,
    },
  });
}
