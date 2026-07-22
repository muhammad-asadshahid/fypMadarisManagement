import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';

import { ScreenWrapper } from '@/components/common/screen-wrapper';
import { StatCard } from '@/components/common/stat-card';
import { useAuthStore } from '@/store/authStore';

export default function DashboardScreen() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);

  return (
    <ScreenWrapper title={t('dashboard.title')}>
      <Card mode="elevated" style={styles.welcomeCard}>
        <Card.Content>
          <Text variant="titleLarge">{t('dashboard.welcome', { name: user?.fullName })}</Text>
          <Text variant="bodyMedium" style={styles.role}>
            {t('dashboard.role', { role: t(`roles.${user?.role}`) })}
          </Text>
        </Card.Content>
      </Card>

      <View style={styles.statsRow}>
        <StatCard label={t('dashboard.totalStudents')} value={3} />
        <StatCard label={t('dashboard.todayAttendance')} value="—" />
      </View>
      <View style={styles.statsRow}>
        <StatCard label={t('dashboard.pendingFees')} value={1} />
        <StatCard label={t('dashboard.hostelResidents')} value={2} />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  welcomeCard: {
    marginBottom: 8,
  },
  role: {
    marginTop: 4,
    opacity: 0.7,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
});
