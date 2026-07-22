import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, Chip, Dialog, Portal, Snackbar, Text } from 'react-native-paper';

import { ScreenWrapper } from '@/components/common/screen-wrapper';
import { PROGRAM_LABEL_KEYS } from '@/constants/programs';
import { studentService } from '@/modules/students/service';
import type { Class, Student } from '@/types';

export default function StudentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const [student, setStudent] = useState<Student | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteReasons, setDeleteReasons] = useState<string[]>([]);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadStudent = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [stu, cls] = await Promise.all([
        studentService.getById(id),
        studentService.getClasses(),
      ]);
      setStudent(stu);
      setClasses(cls);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadStudent();
    }, [loadStudent]),
  );

  const className = classes.find((c) => c.id === student?.classId)?.name ?? '—';

  const handleDeletePress = async () => {
    if (!id) return;
    const check = await studentService.canDelete(id);
    if (!check.canDelete) {
      setDeleteReasons(check.reasons);
      setDeleteDialog(true);
      return;
    }
    setDeleteReasons([]);
    setDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!id || deleteReasons.length > 0) {
      setDeleteDialog(false);
      return;
    }
    setDeleting(true);
    try {
      await studentService.delete(id);
      setSnackbar(t('students.deleted'));
      setDeleteDialog(false);
      setTimeout(() => router.back(), 600);
    } catch {
      setSnackbar(t('common.error'));
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <ScreenWrapper title={t('students.studentDetails')}>
        <ActivityIndicator style={{ marginTop: 48 }} />
      </ScreenWrapper>
    );
  }

  if (!student) {
    return (
      <ScreenWrapper title={t('students.studentDetails')}>
        <Text>{t('common.noData')}</Text>
      </ScreenWrapper>
    );
  }

  const canDelete = deleteReasons.length === 0;

  return (
    <ScreenWrapper title={t('students.studentDetails')}>
      <Card mode="elevated">
        <Card.Content style={styles.content}>
          {student.photoUri ? (
            <Image source={{ uri: student.photoUri }} style={styles.photo} />
          ) : null}

          <Text variant="headlineSmall" style={styles.name}>
            {student.name}
          </Text>

          <View style={styles.chips}>
            <Chip icon="book">{t(PROGRAM_LABEL_KEYS[student.programType])}</Chip>
            <Chip icon={student.hostelStatus ? 'home' : 'walk'}>
              {student.hostelStatus ? t('students.hostelYes') : t('students.hostelNo')}
            </Chip>
          </View>

          <DetailRow label={t('students.fatherName')} value={student.fatherName} />
          <DetailRow label={t('students.dateOfBirth')} value={student.dateOfBirth} />
          <DetailRow label={t('students.address')} value={student.address} />
          <DetailRow label={t('students.contactNumber')} value={student.contactNumber} />
          <DetailRow label={t('students.admissionDate')} value={student.admissionDate} />
          <DetailRow label={t('students.class')} value={className} />
        </Card.Content>
      </Card>

      <View style={styles.actions}>
        <Button
          mode="contained"
          icon="pencil"
          onPress={() => router.push(`/(app)/students/${id}/edit` as never)}>
          {t('common.edit')}
        </Button>
        <Button mode="outlined" icon="delete" textColor="#B00020" onPress={handleDeletePress}>
          {t('common.delete')}
        </Button>
      </View>

      <Portal>
        <Dialog visible={deleteDialog} onDismiss={() => setDeleteDialog(false)}>
          <Dialog.Title>
            {canDelete ? t('students.deleteStudent') : t('students.cannotDelete')}
          </Dialog.Title>
          <Dialog.Content>
            {canDelete ? (
              <Text>{t('students.deleteConfirm')}</Text>
            ) : (
              deleteReasons.map((reason) => (
                <Text key={reason} style={styles.reason}>
                  • {t(`students.${reason}`)}
                </Text>
              ))
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialog(false)}>{t('common.cancel')}</Button>
            {canDelete && (
              <Button onPress={confirmDelete} loading={deleting} textColor="#B00020">
                {t('common.delete')}
              </Button>
            )}
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar visible={!!snackbar} onDismiss={() => setSnackbar(null)} duration={2000}>
        {snackbar}
      </Snackbar>
    </ScreenWrapper>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text variant="labelLarge" style={styles.label}>
        {label}
      </Text>
      <Text variant="bodyLarge" style={styles.value}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 12,
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignSelf: 'center',
  },
  name: {
    textAlign: 'center',
    fontWeight: '700',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  row: {
    gap: 2,
  },
  label: {
    opacity: 0.6,
  },
  value: {
    fontWeight: '500',
  },
  actions: {
    marginTop: 16,
    gap: 8,
  },
  reason: {
    marginBottom: 4,
  },
});
