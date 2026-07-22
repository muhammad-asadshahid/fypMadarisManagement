import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Snackbar } from "react-native-paper";

import { ScreenWrapper } from "@/components/common/screen-wrapper";
import { TeacherForm } from "@/components/teachers/teacher-form";
import { studentService } from "@/modules/students/service";
import type { TeacherSchemaType } from "@/modules/teachers/schema";
import { teacherService } from "@/modules/teachers/service";
import type { Class } from "@/types";

export default function AddTeacherScreen() {
  const { t } = useTranslation();
  const [classes, setClasses] = useState<Class[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  useEffect(() => {
    studentService.getClasses().then(setClasses);
  }, []);

  const handleSubmit = async (data: TeacherSchemaType) => {
    setIsSubmitting(true);
    try {
      await teacherService.create(data);
      setSnackbar(t("common.success"));
      setTimeout(() => router.back(), 800);
    } catch {
      setSnackbar(t("common.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenWrapper title={t("teachers.addTeacher")}>
      <TeacherForm
        classes={classes}
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
