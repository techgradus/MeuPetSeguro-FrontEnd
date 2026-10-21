import { api, ApiError } from '@/services/api';
import { session, type SessionUser } from '@/services/session';

export type SignInPayload = { email: string; password: string };

export type SignUpPayload = { name: string; email: string; password: string; phone?: string };

export type UpdateProfilePayload = { name?: string; email?: string; phone?: string | null };

type LoginResponse = { user: SessionUser; token: string };

export const INVALID_CREDENTIALS = 'INVALID_CREDENTIALS';
export const INVALID_CURRENT_PASSWORD = 'INVALID_CURRENT_PASSWORD';

const BACKEND_WRONG_CURRENT_PASSWORD = 'Senha atual incorreta';

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

  async register({ name, email, password, phone }: SignUpPayload): Promise<void> {
    await api('/auth/register', {
      method: 'POST',
      body: { name, email, password, ...(phone ? { phone } : {}) },
    });
  },

  async signOut(): Promise<void> {
    await session.clear();
  },

  async getMe(): Promise<SessionUser> {
    return api<SessionUser>('/auth/me', { auth: true });
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<SessionUser> {
    const user = await api<SessionUser>('/auth/me', { method: 'PUT', body: payload, auth: true });
    await session.saveUser(user);
    return user;
  },

  async requestPasswordReset(email: string): Promise<void> {
    await api('/auth/forgot-password', { method: 'POST', body: { email } });
  },

  async resetPassword(email: string, code: string, newPassword: string): Promise<void> {
    await api('/auth/reset-password', { method: 'POST', body: { email, code, newPassword } });
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await api('/auth/change-password', {
        method: 'PUT',
        body: { currentPassword, newPassword },
        auth: true,
      });
    } catch (e) {
      if (e instanceof ApiError && e.status === 400 && e.message === BACKEND_WRONG_CURRENT_PASSWORD) {
        throw new Error(INVALID_CURRENT_PASSWORD);
      }
      throw e;
    }
  },
};
