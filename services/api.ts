import { session } from '@/services/session';

const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000').replace(/\/$/, '');

export const API_BASE = `${API_URL}/api`;
export const FILES_BASE = API_URL;

const TIMEOUT_MS = 10000;

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends Error {
  constructor() {
    super('Não foi possível conectar ao servidor.');
    this.name = 'NetworkError';
  }
}

export function errorMessage(e: unknown, fallback = 'Algo deu errado. Tente novamente.'): string {
  return e instanceof ApiError || e instanceof NetworkError ? e.message : fallback;
}

type Options = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  auth?: boolean;
  timeoutMs?: number;
};

let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(fn: (() => void) | null) {
  onUnauthorized = fn;
}

export function fileUrl(path: string): string {
  return /^https?:\/\//i.test(path) ? path : `${FILES_BASE}${path}`;
}

export async function api<T>(
  path: string,
  { method = 'GET', body, auth = false, timeoutMs = TIMEOUT_MS }: Options = {},
): Promise<T> {
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData;

  // Em FormData o Content-Type é definido pelo próprio fetch (inclui o "boundary").
  const headers: Record<string, string> = isForm ? {} : { 'Content-Type': 'application/json' };

  if (auth) {
    const token = await session.getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : isForm ? (body as FormData) : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch {
    throw new NetworkError();
  } finally {
    clearTimeout(timer);
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    // 401 numa chamada autenticada = token expirado/inválido: limpa a sessão e avisa o app.
    if (res.status === 401 && auth) {
      await session.clear();
      onUnauthorized?.();
    }
    throw new ApiError(data?.error ?? 'Erro inesperado do servidor.', res.status);
  }
  return data as T;
}