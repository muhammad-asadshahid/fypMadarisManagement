import { Redirect } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { I18nManager } from 'react-native';

import { AppDrawerContent } from '@/components/common/app-drawer-content';
import { useAuthStore } from '@/store/authStore';

export default function AppLayout() {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Drawer
      drawerContent={(props) => <AppDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        drawerPosition: I18nManager.isRTL ? 'right' : 'left',
        headerTitleStyle: { fontWeight: '600' },
      }}
    />
  );
}
