import { clearAlertsCache } from '@/hooks/useAlerts';
import { clearPetsCache } from '@/hooks/usePets';
import { setUnauthorizedHandler } from '@/services/api';
import { authService, type SignInPayload, type UpdateProfilePayload } from '@/services/authService';
import { session, type SessionUser } from '@/services/session';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';


type AuthContextValue = {
  user: SessionUser | null;
  isLoading: boolean;
  signIn: (payload: SignInPayload) => Promise<void>;
  signOut: () => Promise<void>;
  /** Edita nome/e-mail/telefone no back-end e atualiza o usuário em todo o app. */
  updateProfile: (payload: UpdateProfilePayload) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Ao abrir o app: recupera a sessão salva e valida no back-end (GET /auth/me).
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [token, storedUser] = await Promise.all([session.getToken(), session.getUser()]);
        if (!active) return;

        if (!token || !storedUser) {
          setUser(null);
          return;
        }

        setUser(storedUser);

        // ...e confirma em segundo plano. Se o token foi recusado (401), o api.ts limpa a
        // sessão e chama o handler abaixo (user = null), e o app volta para o login.
        // Se estiver sem internet ou o servidor fora do ar, mantém a sessão salva.
        authService
          .getMe()
          .then((fresh) => {
            if (!active) return;
            setUser(fresh);
            session.saveUser(fresh).catch(() => {});
          })
          .catch(() => {});
      } catch {
        if (active) setUser(null);
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
    return () => setUnauthorizedHandler(null);
  }, []);

  useEffect(() => {
    if (!user) {
      clearPetsCache();
      clearAlertsCache();
    }
  }, [user]);

  const signIn = useCallback(async (payload: SignInPayload) => {
    const loggedUser = await authService.signIn(payload);
    setUser(loggedUser);
  }, []);

  const signOut = useCallback(async () => {
    await authService.signOut();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (payload: UpdateProfilePayload) => {
    const updated = await authService.updateProfile(payload);
    setUser(updated);
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, signIn, signOut, updateProfile }),
    [user, isLoading, signIn, signOut, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>.');
  return ctx;
}