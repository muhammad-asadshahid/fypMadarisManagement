import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import { AuthService } from "../lib/mock-services";

export default function AuthScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [name, setName] = useState("");

  const login = async (role: any) => {
    await AuthService.login(role, name || role);
    router.replace("/(app)/" as never);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("auth.login")}</Text>
      <TextInput
        placeholder={t("auth.email")}
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <View style={styles.btnRow}>
        <Button title={t("roles.admin")} onPress={() => login("admin")} />
        <Button title={t("roles.teacher")} onPress={() => login("teacher")} />
        <Button title={t("roles.parent")} onPress={() => login("parent")} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: "center" },
  title: { fontSize: 24, marginBottom: 16, textAlign: "center" },
  input: { borderWidth: 1, marginBottom: 12, padding: 8, borderRadius: 6 },
  btnRow: { flexDirection: "row", justifyContent: "space-around" },
});
