import { Button } from '@/components/ui/Button';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TextField } from '@/components/ui/TextField';
import { themed } from '@/constants/darkTheme';
import { colors, fonts, spacing } from '@/constants/petTheme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

/*
 * Cadastro de usuário.
 * Aberta pelo botão "Cadastrar" da tela de login (rota /cadastro).
 */

const LOGIN_ROUTE = '/login';

type Errors = Partial<Record<'name' | 'email' | 'phone' | 'password' | 'confirm', string>>;

/** Máscara de telefone: (11) 91234-5678 */
function maskPhone(value: string) {
  const d = value.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function validate(v: { name: string; email: string; phone: string; password: string; confirm: string }): Errors {
  const e: Errors = {};
  if (v.name.trim().length < 2) e.name = 'Informe seu nome.';
  if (!/^\S+@\S+\.\S+$/.test(v.email.trim())) e.email = 'E-mail inválido.';
  if (v.phone && v.phone.replace(/\D/g, '').length < 10) e.phone = 'Telefone inválido.';
  if (v.password.length < 6) e.password = 'A senha precisa ter ao menos 6 caracteres.';
  if (v.confirm !== v.password) e.confirm = 'As senhas não conferem.';
  return e;
}

export default function SignUpScreen() {
  const router = useRouter();
  const { dark } = useAppTheme();
  const styles = useMemo(() => makeStyles(dark), [dark]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  const clear = (key: keyof Errors) => setErrors((e) => ({ ...e, [key]: undefined }));

  const submit = async () => {
    const found = validate({ name, email, phone, password, confirm });
    setErrors(found);
    if (Object.keys(found).length) return;

    try {
      setSaving(true);
      // TODO: chamar a API de cadastro (nome, e-mail, telefone, senha)
      await new Promise((resolve) => setTimeout(resolve, 600));
      router.replace(LOGIN_ROUTE);
    } finally {
      setSaving(false);
    }
  };

  const Error = ({ message }: { message?: string }) =>
    message ? <Text style={styles.error}>{message}</Text> : null;

  return (
    <ScreenContainer>
      <Text style={styles.title}>Crie sua conta</Text>
      <Text style={styles.subtitle}>Cadastre-se para acompanhar quem você mais ama.</Text>

      <TextField
        label="Nome"
        icon="person-outline"
        placeholder="Seu nome completo"
        autoCapitalize="words"
        value={name}
        onChangeText={(t: string) => { setName(t); clear('name'); }}
      />
      <Error message={errors.name} />

      <TextField
        label="E-mail"
        icon="mail-outline"
        placeholder="seu@email.com"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={(t: string) => { setEmail(t); clear('email'); }}
      />
      <Error message={errors.email} />

      <TextField
        label="Telefone (opcional)"
        icon="call-outline"
        placeholder="(11) 91234-5678"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={(t: string) => { setPhone(maskPhone(t)); clear('phone'); }}
      />
      <Error message={errors.phone} />

      <TextField
        label="Senha"
        icon="lock-closed-outline"
        placeholder="Mínimo de 6 caracteres"
        isPassword
        autoCapitalize="none"
        value={password}
        onChangeText={(t: string) => { setPassword(t); clear('password'); }}
      />
      <Error message={errors.password} />

      <TextField
        label="Confirmar senha"
        icon="lock-closed-outline"
        placeholder="Repita a senha"
        isPassword
        autoCapitalize="none"
        value={confirm}
        onChangeText={(t: string) => { setConfirm(t); clear('confirm'); }}
      />
      <Error message={errors.confirm} />

      <View style={styles.action}>
        <Button title="Cadastrar" onPress={submit} loading={saving} />
      </View>

      <TouchableOpacity onPress={() => router.replace(LOGIN_ROUTE)} style={styles.back} hitSlop={8}>
        <Text style={styles.backText}>
          Já tem uma conta? <Text style={styles.backLink}>Entrar</Text>
        </Text>
      </TouchableOpacity>
    </ScreenContainer>
  );
}

const makeStyles = (dark: boolean) =>
  StyleSheet.create(themed({
    title: { fontFamily: fonts.extrabold, fontSize: 24, color: colors.text, textAlign: 'center' },
    subtitle: {
      fontFamily: fonts.medium, fontSize: 12, color: colors.textMuted, textAlign: 'center',
      marginTop: 6, marginBottom: spacing.lg,
    },
    error: { fontFamily: fonts.medium, fontSize: 11, color: colors.error, marginTop: -6, marginBottom: 10 },
    action: { marginTop: spacing.sm },
    back: { alignSelf: 'center', marginTop: spacing.lg },
    backText: { fontFamily: fonts.medium, fontSize: 13, color: colors.textMuted },
    backLink: { fontFamily: fonts.bold, color: colors.primary },
  }, dark));
