import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { colors, spacing } from '@/constants/petTheme';

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
  edges?: Edge[];
  footer?: React.ReactNode;
};

export function ScreenContainer({ children, scroll = true, edges, footer }: Props) {
  return (
    <SafeAreaView style={styles.safe} edges={edges}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={styles.circleTop} />
      <View style={styles.circleBottom} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {scroll ? (
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={styles.content}>{children}</View>
        )}
      </KeyboardAvoidingView>
      {footer}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { flexGrow: 1, padding: spacing.lg, justifyContent: 'center' },
  circleTop: {
    position: 'absolute', top: -80, right: -70, width: 220, height: 220,
    borderRadius: 110, backgroundColor: colors.primaryLight, opacity: 0.6,
  },
  circleBottom: {
    position: 'absolute', bottom: -90, left: -80, width: 240, height: 240,
    borderRadius: 120, backgroundColor: colors.primaryLight, opacity: 0.45,
  },
});
