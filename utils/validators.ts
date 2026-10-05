const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateEmail(value: string): string | null {
  const email = value.trim();
  if (!email) return 'Informe seu e-mail.';
  if (!EMAIL_REGEX.test(email)) return 'Digite um e-mail válido.';
  return null;
}

export function validatePassword(value: string): string | null {
  if (!value) return 'Informe sua senha.';
  if (value.length < 6) return 'A senha deve ter ao menos 6 caracteres.';
  return null;
}
