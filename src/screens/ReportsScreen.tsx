import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";

export default function ReportsScreen() {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("nav.reports")}</Text>
      <Text>{t("common.comingSoon")}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: "600" },
});
