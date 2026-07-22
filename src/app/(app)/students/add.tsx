import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Snackbar } from 'react-native-paper';

import { ScreenWrapper } from '@/components/common/screen-wrapper';
import { StudentForm } from '@/components/students/student-form';
import { studentService } from '@/modules/students/service';
import type { StudentSchemaType } from '@/modules/students/schema';
import type { Class } from '@/types';

export default function AddStudentScreen() {
  const { t } = useTranslation();
  const [classes, setClasses] = useState<Class[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  useEffect(() => {
    studentService.getClasses().then(setClasses);
  }, []);

  const handleSubmit = async (data: StudentSchemaType) => {
    setIsSubmitting(true);
    try {
      await studentService.create(data);
      setSnackbar(t('students.created'));
      setTimeout(() => router.back(), 800);
    } catch {
      setSnackbar(t('common.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenWrapper title={t('students.addStudent')}>
      <StudentForm
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
