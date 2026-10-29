import { useAuth } from '@/hooks/useAuth';
import { fileUrl } from '@/services/api';

/**
 * URL da foto de perfil do usuário logado (ou null quando não há foto).
*/
export function useProfilePhoto(): string | null {
  const { user } = useAuth();
  return user?.photoUrl ? fileUrl(user.photoUrl) : null;
}
