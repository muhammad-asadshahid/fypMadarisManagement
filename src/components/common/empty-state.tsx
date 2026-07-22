import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

interface EmptyStateProps {
  message: string;
  icon?: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  const theme = useTheme();
  return (
    <View style={styles.container}>
      <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    minHeight: 200,
  },
});
