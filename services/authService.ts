import { api, ApiError } from '@/services/api';
import { session, type SessionUser } from '@/services/session';

export type SignInPayload = { email: string; password: string };

type LoginResponse = { user: SessionUser; token: string };

export const TEST_CREDENTIALS = {
  email: 'teste@meupetseguro.com',
  password: '123456',
};

export const INVALID_CREDENTIALS = 'INVALID_CREDENTIALS';
export const INVALID_CURRENT_PASSWORD = 'INVALID_CURRENT_PASSWORD';

const fakeDelay = (ms = 900) => new Promise<void>((res) => setTimeout(res, ms));

export const authService = {
  async signIn({ email, password }: SignInPayload): Promise<SessionUser> {
    try {
      const { token, user } = await api<LoginResponse>('/auth/login', {
        method: 'POST',
        body: { email, password },
      });
      await session.save(token, user);
      return user;
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) throw new Error(INVALID_CREDENTIALS);
      throw e;
    }
  },

  async signOut(): Promise<void> {
    await session.clear();
  },

  async getMe(): Promise<SessionUser> {
    return api<SessionUser>('/auth/me', { auth: true });
  },

  async requestPasswordReset(email: string): Promise<void> {
    await api('/auth/forgot-password', { method: 'POST', body: { email } });
  },

  async resetPassword(email: string, code: string, newPassword: string): Promise<void> {
    await api('/auth/reset-password', { method: 'POST', body: { email, code, newPassword } });
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await fakeDelay();
    if (currentPassword !== TEST_CREDENTIALS.password) throw new Error(INVALID_CURRENT_PASSWORD);
    TEST_CREDENTIALS.password = newPassword;
  },
};
