import { useAuth } from '@/hooks/useAuth';
import { FILES_BASE } from '@/services/api';

/**
 * URL da foto de perfil do usuário logado (ou null quando não há foto).
*/
export function useProfilePhoto(): string | null {
  const { user } = useAuth();
  return user?.photoUrl ? `${FILES_BASE}${user.photoUrl}` : null;
}
