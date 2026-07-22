import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";
import { Avatar, Divider, Drawer, Text, useTheme } from "react-native-paper";

import { getNavItemsForRole } from "@/constants/navigation";
import { useAuthStore } from "@/store/authStore";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function AppDrawerContent(props: any) {
  const { t } = useTranslation();
  const theme = useTheme();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  if (!user) return null;

  const navItems = getNavItemsForRole(user.role);

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Avatar.Icon
          size={56}
          icon="mosque"
          style={{ backgroundColor: theme.colors.primary }}
        />
        <Text variant="titleMedium" style={styles.appName}>
          {t("common.appShortName")}
        </Text>
        <Text
          variant="bodySmall"
          style={{ color: theme.colors.onSurfaceVariant }}
        >
          {user.fullName}
        </Text>
        <Text variant="labelSmall" style={{ color: theme.colors.primary }}>
          {t(`roles.${user.role}`)}
        </Text>
      </View>

      <Divider style={styles.divider} />

      <Drawer.Section>
        {navItems.map((item) => (
          <Drawer.Item
            key={item.name}
            label={t(item.labelKey)}
            icon={item.icon}
            active={props.state?.routes[props.state.index]?.name === item.name}
            onPress={() => router.push(`/(app)/${item.name}` as never)}
          />
        ))}
      </Drawer.Section>

      <Divider style={styles.divider} />

      <Drawer.Item
        label={t("common.logout")}
        icon="logout"
        onPress={handleLogout}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    alignItems: "center",
    gap: 4,
  },
  appName: {
    marginTop: 8,
    fontWeight: "700",
  },
  divider: {
    marginVertical: 8,
  },
});
