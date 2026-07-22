import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';

import { ScreenWrapper } from '@/components/common/screen-wrapper';

interface ModulePlaceholderProps {
  titleKey: string;
}

export function ModulePlaceholder({ titleKey }: ModulePlaceholderProps) {
  const { t } = useTranslation();

  return (
    <ScreenWrapper title={t(titleKey)}>
      <Card mode="elevated" style={styles.card}>
        <Card.Content style={styles.content}>
          <Text variant="headlineSmall" style={styles.icon}>
            🚧
          </Text>
          <Text variant="titleMedium">{t(titleKey)}</Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            {t('common.comingSoon')}
          </Text>
        </Card.Content>
      </Card>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 24,
  },
  content: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 8,
  },
  icon: {
    fontSize: 48,
  },
  subtitle: {
    opacity: 0.6,
    marginTop: 4,
  },
});
