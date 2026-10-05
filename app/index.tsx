import { Redirect } from 'expo-router';

// O app abre direto no Login. A Splash é exibida após o login (app/splash.tsx).
export default function Index() {
  return <Redirect href="/login" />;
}
