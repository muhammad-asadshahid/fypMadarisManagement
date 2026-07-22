import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Button, StyleSheet, Text, View } from "react-native";
import { AuthService } from "../lib/mock-services";

export default function Dashboard() {
  const { t } = useTranslation();
  const router = useRouter();
  const user = AuthService.getUser();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("dashboard.title")}</Text>
      <Text>{t("dashboard.welcome", { name: user?.name || "" })}</Text>
      <View style={{ marginTop: 20 }}>
        <Button
          title={t("nav.students")}
          onPress={() => router.push("/(app)/students" as never)}
        />
        <Button
          title={t("nav.attendance")}
          onPress={() => router.push("/(app)/attendance" as never)}
        />
        <Button
          title={t("nav.reports")}
          onPress={() => router.push("/(app)/reports" as never)}
        />
      </View>
      <View style={{ marginTop: 20 }}>
        <Button
          title={t("common.logout")}
          onPress={() => {
            AuthService.logout();
            router.replace("/");
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: "600", marginBottom: 8 },
});
