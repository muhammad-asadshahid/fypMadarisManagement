import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Text, useTheme } from 'react-native-paper';

import { ScreenWrapper } from '@/components/common/screen-wrapper';
import { useSettingsStore } from '@/store/settingsStore';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const language = useSettingsStore((s) => s.language);
  const isRTL = useSettingsStore((s) => s.isRTL);
  const setLanguage = useSettingsStore((s) => s.setLanguage);

  return (
    <ScreenWrapper title={t('settings.title')}>
      <Card mode="elevated">
        <Card.Content style={styles.content}>
          <Text variant="titleMedium">{t('settings.language')}</Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {isRTL ? t('settings.rtlNote') : ''}
          </Text>

          <View style={styles.buttons}>
            <Button
              mode={language === 'en' ? 'contained' : 'outlined'}
              onPress={() => setLanguage('en')}
              style={styles.langButton}>
              {t('settings.english')}
            </Button>
            <Button
              mode={language === 'ur' ? 'contained' : 'outlined'}
              onPress={() => setLanguage('ur')}
              style={styles.langButton}>
              {t('settings.urdu')}
            </Button>
          </View>
        </Card.Content>
      </Card>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 12,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  langButton: {
    flex: 1,
  },
});
