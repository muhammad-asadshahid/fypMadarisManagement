import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Snackbar } from "react-native-paper";

import { ScreenWrapper } from "@/components/common/screen-wrapper";
import { TeacherForm } from "@/components/teachers/teacher-form";
import { studentService } from "@/modules/students/service";
import type { TeacherSchemaType } from "@/modules/teachers/schema";
import { teacherService } from "@/modules/teachers/service";
import type { Class, Teacher } from "@/types";

export default function EditTeacherScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [teacherRecord, classList] = await Promise.all([
        teacherService.getById(id),
        studentService.getClasses(),
      ]);
      setTeacher(teacherRecord);
      setClasses(classList);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const handleSubmit = async (data: TeacherSchemaType) => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      await teacherService.update(id, data);
      setSnackbar(t("teachers.updated"));
      setTimeout(() => router.back(), 800);
    } catch {
      setSnackbar(t("common.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ScreenWrapper title={t("teachers.editTeacher")}>
        <ActivityIndicator style={{ marginTop: 48 }} />
      </ScreenWrapper>
    );
  }

  if (!teacher) {
    return null;
  }

  return (
    <ScreenWrapper title={t("teachers.editTeacher")}>
      <TeacherForm
        classes={classes}
        initialData={teacher}
        onSubmit={handleSubmit}
        submitLabel={t("common.save")}
        isSubmitting={isSubmitting}
      />
      <Snackbar
        visible={!!snackbar}
        onDismiss={() => setSnackbar(null)}
        duration={2000}
      >
        {snackbar}
      </Snackbar>
    </ScreenWrapper>
  );
}
