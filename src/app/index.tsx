import { useAuth } from '@/hooks/useAuth';
import { Redirect } from 'expo-router';

export default function Index() {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  return <Redirect href={user ? '/splash' : '/login'} />;
}
