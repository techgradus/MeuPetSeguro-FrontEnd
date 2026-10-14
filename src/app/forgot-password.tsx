import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { FeedbackBanner } from '@/components/ui/FeedbackBanner';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TextField } from '@/components/ui/TextField';
import { colors, fonts, radius, spacing } from '@/constants/petTheme';
import { ApiError } from '@/services/api';
import { authService } from '@/services/authService';
import { validateEmail, validatePassword } from '@/utils/validators';

type Step = 'email' | 'reset' | 'done';

type Errors = {
  email?: string | null;
  code?: string | null;
  newPassword?: string | null;
  confirm?: string | null;
};

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState(params.email ?? '');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const goToLogin = () => router.replace('/login');

  const clearError = (key: keyof Errors) => {
    setFormError(null);
    if (errors[key]) setErrors((e) => ({ ...e, [key]: null }));
  };

  const sendCode = async (resend = false) => {
    const emailError = validateEmail(email);
    setErrors({ email: emailError });
    setFormError(null);
    if (emailError) return;

    try {
      setLoading(true);
      await authService.requestPasswordReset(email.trim());
      setStep('reset');
      setInfo(
        resend
          ? 'Se o e-mail estiver cadastrado, enviamos um novo código. Se você acabou de pedir um, aguarde 1 minuto.'
          : 'Se o e-mail estiver cadastrado, enviamos um código de 6 dígitos. Ele vale por 15 minutos.',
      );
    } catch {
      setFormError('Não foi possível enviar agora. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    const next: Errors = {
      code: /^\d{6}$/.test(code) ? null : 'Digite o código de 6 dígitos.',
      newPassword: validatePassword(newPassword),
      confirm: confirm === newPassword ? null : 'As senhas não coincidem.',
    };
    setErrors(next);
    setFormError(null);
    if (next.code || next.newPassword || next.confirm) return;

    try {
      setLoading(true);
      await authService.resetPassword(email.trim(), code, newPassword);
      setStep('done');
    } catch (e) {
      // 400 = código inválido/expirado
      setFormError(
        e instanceof ApiError && e.status === 400
          ? e.message
          : 'Não foi possível redefinir agora. Tente novamente.',
      );
    } finally {
      setLoading(false);
    }
  };

  const subtitle =
    step === 'email'
      ? 'Sem problemas! Informe o e-mail cadastrado e enviaremos um código de 6 dígitos para você criar uma nova senha.'
      : step === 'reset'
        ? `Digite o código enviado para ${email.trim()} e escolha sua nova senha.`
        : 'Tudo certo! Agora você já pode entrar com a nova senha.';

  return (
    <ScreenContainer>
      <TouchableOpacity style={styles.back} onPress={goToLogin} hitSlop={10}>
        <Ionicons name="arrow-back" size={20} color={colors.primary} />
        <Text style={styles.backText}>Voltar para o login</Text>
      </TouchableOpacity>

      <View style={styles.iconCircle}>
        <Ionicons
          name={step === 'done' ? 'checkmark-circle-outline' : 'key-outline'}
          size={34}
          color={colors.primary}
        />
      </View>

      <Text style={styles.title}>{step === 'done' ? 'Senha alterada' : 'Esqueci minha senha'}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      {!!formError && <FeedbackBanner type="error" message={formError} />}

      {step === 'email' && (
        <>
          <TextField
            label="E-mail cadastrado"
            icon="mail-outline"
            placeholder="seuemail@exemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={(t) => { setEmail(t); clearError('email'); }}
            onBlur={() => email && setErrors((e) => ({ ...e, email: validateEmail(email) }))}
            error={errors.email}
          />

          <Button title="Enviar código" onPress={() => sendCode(false)} loading={loading} />
        </>
      )}

      {step === 'reset' && (
        <>
          {!!info && <FeedbackBanner message={info} />}

          <TextField
            label="Código de 6 dígitos"
            icon="keypad-outline"
            placeholder="000000"
            keyboardType="number-pad"
            maxLength={6}
            autoCapitalize="none"
            autoCorrect={false}
            value={code}
            onChangeText={(t) => { setCode(t.replace(/\D/g, '')); clearError('code'); }}
            error={errors.code}
          />

          <TextField
            label="Nova senha"
            icon="lock-closed-outline"
            placeholder="Mínimo de 6 caracteres"
            isPassword
            autoCapitalize="none"
            value={newPassword}
            onChangeText={(t) => { setNewPassword(t); clearError('newPassword'); }}
            error={errors.newPassword}
          />

          <TextField
            label="Confirmar nova senha"
            icon="lock-closed-outline"
            placeholder="Repita a nova senha"
            isPassword
            autoCapitalize="none"
            value={confirm}
            onChangeText={(t) => { setConfirm(t); clearError('confirm'); }}
            error={errors.confirm}
          />

          <Button title="Redefinir senha" onPress={resetPassword} loading={loading} />

          <TouchableOpacity style={styles.bottomLink} onPress={() => sendCode(true)} disabled={loading}>
            <Text style={styles.linkText}>Não recebeu? <Text style={styles.link}>Reenviar código</Text></Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.smallLink}
            onPress={() => { setStep('email'); setFormError(null); setInfo(null); setErrors({}); }}
          >
            <Text style={styles.link}>Usar outro e-mail</Text>
          </TouchableOpacity>
        </>
      )}

      {step === 'done' && (
        <>
          <FeedbackBanner message="Senha redefinida com sucesso!" />
          <Button title="Ir para o login" onPress={goToLogin} />
        </>
      )}

      {step === 'email' && (
        <TouchableOpacity style={styles.bottomLink} onPress={goToLogin}>
          <Text style={styles.linkText}>Lembrou a senha? <Text style={styles.link}>Entrar</Text></Text>
        </TouchableOpacity>
      )}
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
  smallLink: { alignItems: 'center', marginTop: spacing.sm },
  linkText: { fontFamily: fonts.medium, fontSize: 14, color: colors.textMuted },
  link: { fontFamily: fonts.bold, color: colors.primary },
});
