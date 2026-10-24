import { Button } from '@/components/ui/Button';
import { FeedbackBanner } from '@/components/ui/FeedbackBanner';
import { useAuth } from '@/hooks/useAuth';
import { Logo } from '@/components/ui/Logo';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { TextField } from '@/components/ui/TextField';
import { themed } from '@/constants/darkTheme';
import { colors, fonts, spacing } from '@/constants/petTheme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useResponsive } from '@/hooks/useResponsive';
import { INVALID_CREDENTIALS } from '@/services/authService';
import { validateEmail, validatePassword } from '@/utils/validators';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';


export default function LoginScreen() {
  const router = useRouter();
  const { ms, isSmallHeight } = useResponsive();
  const { dark } = useAppTheme();
  const styles = useMemo(() => makeStyles(dark), [dark]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string | null; password?: string | null }>({});
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { signIn } = useAuth();

  const handleLogin = async () => {
    const next = { email: validateEmail(email), password: validatePassword(password) };
    setErrors(next);
    setFormError(null);
    if (next.email || next.password) return;

    try {
      setLoading(true);
      await signIn({ email: email.trim(), password });
      router.replace('/splash');
    } catch (e) {
      const invalid = e instanceof Error && e.message === INVALID_CREDENTIALS;
      setFormError(
        invalid
          ? 'E-mail ou senha incorretos.'
          : 'Não foi possível entrar. Tente novamente em instantes.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Logo size={isSmallHeight ? 90 : ms(130)} />
        <Text style={[styles.title, { fontSize: ms(26) }]}>Olá, bem-vindo(a)!</Text>
        <Text style={[styles.subtitle, { fontSize: ms(14) }]}>Entre para acompanhar quem você mais ama.</Text>
      </View>

      {!!formError && <FeedbackBanner type="error" message={formError} />}

      <TextField
        label="E-mail"
        icon="mail-outline"
        placeholder="seuemail@exemplo.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        value={email}
        onChangeText={(t) => { setEmail(t); if (errors.email) setErrors((e) => ({ ...e, email: null })); }}
        onBlur={() => setErrors((e) => ({ ...e, email: validateEmail(email) }))}
        error={errors.email}
      />

      <TextField
        label="Senha"
        icon="lock-closed-outline"
        placeholder="Digite sua senha"
        isPassword
        autoCapitalize="none"
        value={password}
        onChangeText={(t) => { setPassword(t); if (errors.password) setErrors((e) => ({ ...e, password: null })); }}
        onBlur={() => setErrors((e) => ({ ...e, password: validatePassword(password) }))}
        error={errors.password}
      />

      <TouchableOpacity
        style={styles.forgot}
        onPress={() => router.push({ pathname: '/forgot-password', params: { email: email.trim() } })}
      >
        <Text style={styles.link}>Esqueci minha senha</Text>
      </TouchableOpacity>

      <Button title="Entrar" onPress={handleLogin} loading={loading} />

      <View style={styles.signup}>
        <SecondaryButton title="Cadastrar" onPress={() => router.push('/cadastro')} />
      </View>
    </ScreenContainer>
  );
}

const makeStyles = (dark: boolean) => StyleSheet.create(themed({
  header: { alignItems: 'center', marginBottom: spacing.lg },
  title: { fontFamily: fonts.extrabold, fontSize: 26, color: colors.text, marginTop: 4 },
  subtitle: { fontFamily: fonts.medium, fontSize: 14, color: colors.textMuted, marginTop: 4, textAlign: 'center' },
  forgot: { alignSelf: 'flex-end', marginBottom: spacing.lg, marginTop: -4 },
  link: { fontFamily: fonts.bold, fontSize: 13, color: colors.primary },
  signup: { marginTop: 12 },
}, dark));
