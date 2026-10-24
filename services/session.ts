import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  photoUrl?: string | null;
};

const storage = {
  async get(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
    }
    return SecureStore.getItemAsync(key);
  },
  async set(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  async remove(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

export const session = {
  getToken: () => storage.get(TOKEN_KEY),

  async getUser(): Promise<SessionUser | null> {
    const raw = await storage.get(USER_KEY);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  },

  async save(token: string, user: SessionUser): Promise<void> {
    await storage.set(TOKEN_KEY, token);
    await storage.set(USER_KEY, JSON.stringify(user));
  },

  async saveUser(user: SessionUser): Promise<void> {
    await storage.set(USER_KEY, JSON.stringify(user));
  },

  async clear(): Promise<void> {
    await storage.remove(TOKEN_KEY);
    await storage.remove(USER_KEY);
  },
};