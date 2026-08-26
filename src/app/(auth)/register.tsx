import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Snackbar, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RegistrationForm } from '@/components/registrations/registration-form';
import type { RegistrationSchemaType } from '@/modules/registrations/schema';
import { registrationService } from '@/modules/registrations/service';

export default function RegisterScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  const handleSubmit = async (data: RegistrationSchemaType) => {
    setIsSubmitting(true);
    try {
      const { confirmPassword: _confirm, ...payload } = data;
      await registrationService.submit(payload);
      setSnackbar(t('registration.submitted'));
      setTimeout(() => router.replace('/(auth)/login'), 800);
    } catch {
      setSnackbar(t('common.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.colors.background }]}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
              {t('common.appShortName')}
            </Text>
            <Text variant="titleMedium" style={styles.subtitle}>
              {t('registration.title')}
            </Text>
            <Text
              variant="bodySmall"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              {t('registration.subtitle')}
            </Text>
          </View>

          <Card style={styles.card} mode="elevated">
            <Card.Content style={styles.cardContent}>
              <RegistrationForm
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
              />
            </Card.Content>
          </Card>

          <Button
            mode="text"
            onPress={() => router.back()}
            disabled={isSubmitting}
            style={styles.backButton}
          >
            {t('common.back')}
          </Button>

          <Snackbar
            visible={!!snackbar}
            onDismiss={() => setSnackbar(null)}
            duration={2000}
          >
            {snackbar}
          </Snackbar>
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
    padding: 24,
    gap: 16,
  },
  header: {
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  title: {
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 4,
    fontWeight: '600',
  },
  card: {
    borderRadius: 16,
  },
  cardContent: {
    gap: 4,
  },
  backButton: {
    marginTop: 4,
  },
});
