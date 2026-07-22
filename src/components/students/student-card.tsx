import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { Card, Chip, Text, useTheme } from 'react-native-paper';

import { PROGRAM_LABEL_KEYS } from '@/constants/programs';
import type { Class, Student } from '@/types';

interface StudentCardProps {
  student: Student;
  classes: Class[];
}

export function StudentCard({ student, classes }: StudentCardProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const className = classes.find((c) => c.id === student.classId)?.name ?? '—';

  return (
    <Pressable onPress={() => router.push(`/(app)/students/${student.id}` as never)}>
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <View style={styles.row}>
            <View style={styles.info}>
              <Text variant="titleMedium" style={styles.name}>
                {student.name}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {t('students.fatherName')}: {student.fatherName}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {className}
              </Text>
            </View>
            <View style={styles.chips}>
              <Chip compact mode="flat" style={styles.chip}>
                {t(PROGRAM_LABEL_KEYS[student.programType])}
              </Chip>
              <Chip
                compact
                mode="flat"
                icon={student.hostelStatus ? 'home' : 'walk'}
                style={styles.chip}>
                {student.hostelStatus ? t('students.hostelYes') : t('students.hostelNo')}
              </Chip>
            </View>
          </View>
        </Card.Content>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontWeight: '600',
  },
  chips: {
    alignItems: 'flex-end',
    gap: 4,
  },
  chip: {
    height: 28,
  },
});
