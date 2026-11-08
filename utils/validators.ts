const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateEmail(value: string): string | null {
  const email = value.trim();
  if (!email) return 'Informe seu e-mail.';
  if (!EMAIL_REGEX.test(email)) return 'Digite um e-mail válido.';
  return null;
}

export const MIN_PASSWORD_LENGTH = 6;
export const MIN_NAME_LENGTH = 2;

export function validatePassword(value: string): string | null {
  if (!value) return 'Informe sua senha.';
  if (value.length < MIN_PASSWORD_LENGTH) return `A senha deve ter ao menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  return null;
}

export function validateName(value: string): string | null {
  const name = value.trim();
  if (!name) return 'Informe seu nome.';
  if (name.length < MIN_NAME_LENGTH) return `O nome precisa ter ao menos ${MIN_NAME_LENGTH} letras.`;
  return null;
}