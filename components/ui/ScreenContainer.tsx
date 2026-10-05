import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@/constants/petTheme';

type Props = { children: React.ReactNode; scroll?: boolean };

export function ScreenContainer({ children, scroll = true }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
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
