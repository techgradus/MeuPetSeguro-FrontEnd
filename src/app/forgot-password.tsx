import React, { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TextField } from '@/components/ui/TextField';
import { Button } from '@/components/ui/Button';
import { FeedbackBanner } from '@/components/ui/FeedbackBanner';
import { validateEmail } from '@/utils/validators';
import { authService } from '@/services/authService';
import { colors, fonts, radius, spacing } from '@/constants/petTheme';


export default function ForgotPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(params.email ?? '');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    const validation = validateEmail(email);
    setError(validation);
    if (validation) return;

    try {
      setLoading(true);
      await authService.requestPasswordReset(email.trim());
      setSent(true);
    } catch {
      setError('Não foi possível enviar agora. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => router.replace('/login');

  return (
    <ScreenContainer>
      <TouchableOpacity style={styles.back} onPress={goToLogin} hitSlop={10}>
        <Ionicons name="arrow-back" size={20} color={colors.primary} />
        <Text style={styles.backText}>Voltar para o login</Text>
      </TouchableOpacity>

      <View style={styles.iconCircle}>
        <Ionicons name="key-outline" size={34} color={colors.primary} />
      </View>

      <Text style={styles.title}>Esqueci minha senha</Text>
      <Text style={styles.subtitle}>
        Sem problemas! Informe o e-mail cadastrado e enviaremos um link para você criar uma nova senha.
      </Text>

      {sent && (
        <FeedbackBanner message="Pronto! Se o e-mail estiver cadastrado, você receberá as instruções em instantes." />
      )}

      <TextField
        label="E-mail cadastrado"
        icon="mail-outline"
        placeholder="seuemail@exemplo.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        value={email}
        onChangeText={(t) => { setEmail(t); setError(null); setSent(false); }}
        onBlur={() => email && setError(validateEmail(email))}
        error={error}
      />

      <Button title="Enviar" onPress={handleSend} loading={loading} />

      <TouchableOpacity style={styles.bottomLink} onPress={goToLogin}>
        <Text style={styles.linkText}>Lembrou a senha? <Text style={styles.link}>Entrar</Text></Text>
      </TouchableOpacity>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  back: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', marginBottom: spacing.lg },
  backText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.primary },
  iconCircle: {
    width: 72, height: 72, borderRadius: radius.xl, backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md,
  },
  title: { fontFamily: fonts.extrabold, fontSize: 26, color: colors.text },
  subtitle: {
    fontFamily: fonts.medium, fontSize: 14, lineHeight: 21, color: colors.textMuted,
    marginTop: 8, marginBottom: spacing.lg,
  },
  bottomLink: { alignItems: 'center', marginTop: spacing.lg },
  linkText: { fontFamily: fonts.medium, fontSize: 14, color: colors.textMuted },
  link: { fontFamily: fonts.bold, color: colors.primary },
});
