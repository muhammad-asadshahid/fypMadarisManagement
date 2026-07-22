import { Redirect } from 'expo-router';

import { useAuthStore } from '@/store/authStore';

export default function Index() {
  const user = useAuthStore((s) => s.user);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  if (!isInitialized) return null;

  if (user) {
    return <Redirect href={'/(app)/' as never} />;
  }

  return <Redirect href="/(auth)/login" />;
}
