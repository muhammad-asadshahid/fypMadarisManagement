import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Image, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, Chip, Snackbar, Text, useTheme } from 'react-native-paper';

import { EmptyState } from '@/components/common/empty-state';
import { ScreenWrapper } from '@/components/common/screen-wrapper';
import { PROGRAM_LABEL_KEYS } from '@/constants/programs';
import { registrationService } from '@/modules/registrations/service';
import type { Registration } from '@/types';

export default function ApprovalsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  const loadPending = useCallback(async () => {
    try {
      const pending = await registrationService.getPending();
      setRegistrations(pending);
    } catch (err) {
      // Surface the real reason (e.g. a missing Firestore index URL) so the
      // failure is diagnosable instead of a silent generic toast.
      const message =
        err instanceof Error && err.message ? err.message : t('common.error');
      setSnackbar(message);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadPending();
    }, [loadPending]),
  );

  const handleApprove = async (id: string) => {
    setBusyId(id);
    try {
      await registrationService.approve(id);
      setSnackbar(t('registration.approved'));
      await loadPending();
    } catch {
      setSnackbar(t('common.error'));
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (id: string) => {
    setBusyId(id);
    try {
      await registrationService.reject(id);
      setSnackbar(t('registration.rejected'));
      await loadPending();
    } catch {
      setSnackbar(t('common.error'));
    } finally {
      setBusyId(null);
    }
  };

  const renderItem = ({ item }: { item: Registration }) => {
    const fullName = `${item.firstName} ${item.lastName}`.trim();
    const busy = busyId === item.id;
    return (
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.identity}>
              {item.photoUri ? (
                <Image source={{ uri: item.photoUri }} style={styles.photo} />
              ) : (
                <View
                  style={[
                    styles.photo,
                    styles.photoPlaceholder,
                    { backgroundColor: theme.colors.surfaceVariant },
                  ]}
                />
              )}
              <View style={styles.identityText}>
                <Text variant="titleMedium" style={styles.name}>
                  {fullName}
                </Text>
                <Text
                  variant="bodySmall"
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  {t('registration.fatherName')}: {item.fatherName}
                </Text>
              </View>
            </View>
            <Chip icon="book-open-page-variant">
              {t(PROGRAM_LABEL_KEYS[item.programType])}
            </Chip>
          </View>

          <View style={styles.details}>
            <Text variant="bodySmall">
              {t('registration.guardianEmail')}: {item.guardianEmail}
            </Text>
            <Text variant="bodySmall">
              {t('registration.guardianMobile')}: {item.guardianMobile}
            </Text>
            <Text variant="bodySmall">
              {t('registration.bFormCnic')}: {item.bFormCnic}
            </Text>
            <Text variant="bodySmall">
              {t('registration.city')}: {item.city}
            </Text>
            <Text variant="bodySmall">
              {t('registration.submittedAt')}:{' '}
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.actions}>
            <Button
              mode="contained"
              icon="check"
              onPress={() => handleApprove(item.id)}
              loading={busy}
              disabled={busyId !== null}
              style={styles.approveButton}
            >
              {t('registration.approve')}
            </Button>
            <Button
              mode="outlined"
              icon="close"
              onPress={() => handleReject(item.id)}
              loading={busy}
              disabled={busyId !== null}
              textColor={theme.colors.error}
            >
              {t('registration.reject')}
            </Button>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <ScreenWrapper title={t('registration.pendingTitle')}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      ) : registrations.length === 0 ? (
        <EmptyState message={t('registration.empty')} />
      ) : (
        <FlatList
          data={registrations}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
      <Snackbar
        visible={!!snackbar}
        onDismiss={() => setSnackbar(null)}
        duration={6000}
      >
        {snackbar}
      </Snackbar>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  list: {
    paddingBottom: 32,
    gap: 8,
  },
  card: {
    marginBottom: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  identityText: {
    flex: 1,
  },
  name: {
    fontWeight: '600',
  },
  photo: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  photoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  details: {
    marginTop: 12,
    gap: 2,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 16,
  },
  approveButton: {
    flex: 1,
  },
});
