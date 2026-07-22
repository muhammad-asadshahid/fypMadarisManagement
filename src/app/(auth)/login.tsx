import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  Button,
  Card,
  HelperText,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { loginSchema, type LoginSchemaType } from "@/modules/auth/schema";
import { useAuthStore } from "@/store/authStore";

export default function LoginScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginSchemaType) => {
    setError(null);
    try {
      await login(data.email, data.password);
      router.replace("/(app)/" as never);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "auth.invalidCredentials";
      setError(t(message));
    }
  };

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.colors.background }]}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text
              variant="displaySmall"
              style={[styles.title, { color: theme.colors.primary }]}
            >
              {t("common.appShortName")}
            </Text>
            <Text
              variant="titleMedium"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              {t("common.appName")}
            </Text>
            <Text variant="bodyLarge" style={styles.welcome}>
              {t("auth.welcomeBack")}
            </Text>
          </View>

          <Card style={styles.card} mode="elevated">
            <Card.Content style={styles.cardContent}>
              <Text variant="titleLarge" style={styles.loginTitle}>
                {t("auth.login")}
              </Text>

              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label={t("auth.email")}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    mode="outlined"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    error={!!errors.email}
                    left={<TextInput.Icon icon="email" />}
                  />
                )}
              />
              <HelperText type="error" visible={!!errors.email}>
                {errors.email?.message ? t(errors.email.message) : ""}
              </HelperText>

              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label={t("auth.password")}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    mode="outlined"
                    secureTextEntry
                    error={!!errors.password}
                    left={<TextInput.Icon icon="lock" />}
                  />
                )}
              />
              <HelperText type="error" visible={!!errors.password}>
                {errors.password?.message ? t(errors.password.message) : ""}
              </HelperText>

              {error && (
                <HelperText type="error" visible>
                  {error}
                </HelperText>
              )}

              <Button
                mode="contained"
                onPress={handleSubmit(onSubmit)}
                loading={isLoading}
                disabled={isLoading}
                style={styles.signIn}
              >
                {isLoading ? t("auth.signingIn") : t("auth.signIn")}
              </Button>
            </Card.Content>
          </Card>

          <Card style={styles.demoCard} mode="outlined">
            <Card.Content>
              <Text variant="titleSmall" style={styles.demoTitle}>
                {t("auth.demoAccounts")}
              </Text>
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                {t("auth.adminDemo")}
              </Text>
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                {t("auth.teacherDemo")}
              </Text>
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                {t("auth.parentDemo")}
              </Text>
              <View style={styles.demoButtons}>
                <Button
                  mode="contained"
                  onPress={() =>
                    onSubmit({
                      email: "admin@mms.com",
                      password: "admin123",
                    } as any)
                  }
                >
                  {t("roles.admin")}
                </Button>
                <Button
                  mode="contained"
                  onPress={() =>
                    onSubmit({
                      email: "teacher@mms.com",
                      password: "teacher123",
                    } as any)
                  }
                >
                  {t("roles.teacher")}
                </Button>
                <Button
                  mode="contained"
                  onPress={() =>
                    onSubmit({
                      email: "parent@mms.com",
                      password: "parent123",
                    } as any)
                  }
                >
                  {t("roles.parent")}
                </Button>
              </View>
            </Card.Content>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
    gap: 16,
  },
  header: {
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  title: {
    fontWeight: "800",
  },
  welcome: {
    marginTop: 8,
  },
  card: {
    borderRadius: 16,
  },
  cardContent: {
    gap: 4,
  },
  loginTitle: {
    marginBottom: 8,
    fontWeight: "600",
  },
  signIn: {
    marginTop: 12,
    paddingVertical: 4,
  },
  demoCard: {
    borderRadius: 12,
  },
  demoTitle: {
    marginBottom: 8,
    fontWeight: "600",
  },
  demoButtons: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
});
