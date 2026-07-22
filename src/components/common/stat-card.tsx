import { StyleSheet } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: string;
}

export function StatCard({ label, value }: StatCardProps) {
  const theme = useTheme();
  return (
    <Card style={styles.card} mode="elevated">
      <Card.Content style={styles.content}>
        <Text variant="headlineMedium" style={{ color: theme.colors.primary, fontWeight: '700' }}>
          {value}
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          {label}
        </Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 140,
  },
  content: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
  },
});
