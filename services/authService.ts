/**
 * Camada de autenticação (MOCK).
 * Quando o back-end estiver pronto, apague TEST_CREDENTIALS e troque o corpo
 * destas funções por chamadas reais à API. As telas não precisam mudar.
 */
export type SignInPayload = { email: string; password: string };

// ⚠️ APENAS PARA TESTE — remover ao integrar o back-end.
export const TEST_CREDENTIALS = {
  email: 'teste@meupetseguro.com',
  password: '123456',
};

export const INVALID_CREDENTIALS = 'INVALID_CREDENTIALS';
export const INVALID_CURRENT_PASSWORD = 'INVALID_CURRENT_PASSWORD';

const fakeDelay = (ms = 900) => new Promise<void>((res) => setTimeout(res, ms));

export const authService = {
  async signIn({ email, password }: SignInPayload): Promise<void> {
    // TODO: POST /auth/login
    await fakeDelay();
    const ok =
      email.trim().toLowerCase() === TEST_CREDENTIALS.email &&
      password === TEST_CREDENTIALS.password;
    if (!ok) throw new Error(INVALID_CREDENTIALS);
  },

  async requestPasswordReset(_email: string): Promise<void> {
    // TODO: POST /auth/forgot-password
    await fakeDelay();
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    // TODO: POST /auth/change-password
    await fakeDelay();
    if (currentPassword !== TEST_CREDENTIALS.password) throw new Error(INVALID_CURRENT_PASSWORD);
    TEST_CREDENTIALS.password = newPassword; // MOCK: vale só até recarregar o app
  },
};
