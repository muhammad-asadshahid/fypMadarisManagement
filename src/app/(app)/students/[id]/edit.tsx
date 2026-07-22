import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Snackbar } from 'react-native-paper';

import { ScreenWrapper } from '@/components/common/screen-wrapper';
import { StudentForm } from '@/components/students/student-form';
import { studentService } from '@/modules/students/service';
import type { StudentSchemaType } from '@/modules/students/schema';
import type { Class, Student } from '@/types';

export default function EditStudentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const [student, setStudent] = useState<Student | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  const loadData = useCallback(async () => {
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
      loadData();
    }, [loadData]),
  );

  const handleSubmit = async (data: StudentSchemaType) => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      await studentService.update(id, data);
      setSnackbar(t('students.updated'));
      setTimeout(() => router.back(), 800);
    } catch {
      setSnackbar(t('common.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ScreenWrapper title={t('students.editStudent')}>
        <ActivityIndicator style={{ marginTop: 48 }} />
      </ScreenWrapper>
    );
  }

  if (!student) {
    return null;
  }

  return (
    <ScreenWrapper title={t('students.editStudent')}>
      <StudentForm
        initialData={student}
        classes={classes}
        onSubmit={handleSubmit}
        submitLabel={t('common.save')}
        isSubmitting={isSubmitting}
      />
      <Snackbar visible={!!snackbar} onDismiss={() => setSnackbar(null)} duration={2000}>
        {snackbar}
      </Snackbar>
    </ScreenWrapper>
  );
}
