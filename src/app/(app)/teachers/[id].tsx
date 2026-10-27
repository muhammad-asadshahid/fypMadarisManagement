import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  Dialog,
  Portal,
  Snackbar,
  Text,
} from "react-native-paper";

import { ScreenWrapper } from "@/components/common/screen-wrapper";
import { studentService } from "@/modules/students/service";
import { teacherService } from "@/modules/teachers/service";
import type { Class, Teacher } from "@/types";

export default function TeacherDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadTeacher = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const teacherRecord = await teacherService.getById(id);
      setTeacher(teacherRecord);
      setClasses(await studentService.getClasses());
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadTeacher();
    }, [loadTeacher]),
  );

  const teacherClassNames = teacher?.classIds?.map(
    (classId) => classes.find((c) => c.id === classId)?.name ?? classId,
  );

  const confirmDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await teacherService.delete(id);
      setSnackbar(t("teachers.deleted"));
      setDeleteDialog(false);
      setTimeout(() => router.back(), 600);
    } catch {
      setSnackbar(t("common.error"));
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <ScreenWrapper title={t("teachers.teacherDetails")}>
        <ActivityIndicator style={{ marginTop: 48 }} />
      </ScreenWrapper>
    );
  }

  if (!teacher) {
    return (
      <ScreenWrapper title={t("teachers.teacherDetails")}>
        <Text>{t("common.noData")}</Text>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper title={t("teachers.teacherDetails")}>
      <Card mode="elevated">
        <Card.Content style={styles.content}>
          <Text variant="headlineSmall" style={styles.name}>
            {teacher.name}
          </Text>
          <Text variant="bodyMedium">
            {t("teachers.email")}: {teacher.email ?? t("common.noData")}
          </Text>
          <Text variant="bodyMedium">{teacher.contactNumber}</Text>
          <Text variant="bodySmall">
            {t("teachers.salary")}: {teacher.salary}
          </Text>
          <Text variant="bodySmall">
            {t("teachers.subjects")}:{" "}
            {teacher.subjects?.join(", ") || t("common.noData")}
          </Text>
          <Text variant="bodySmall">
            {t("teachers.assignedClasses")}:{" "}
            {teacherClassNames?.length
              ? teacherClassNames.join(", ")
              : t("common.noData")}
          </Text>
        </Card.Content>
      </Card>

      <View style={styles.actions}>
        <Button
          mode="contained"
          icon="pencil"
          onPress={() => router.push(`/(app)/teachers/${id}/edit` as never)}
        >
          {t("common.edit")}
        </Button>
        <Button
          mode="outlined"
          icon="delete"
          textColor="#B00020"
          onPress={() => setDeleteDialog(true)}
        >
          {t("common.delete")}
        </Button>
      </View>

      <Portal>
        <Dialog visible={deleteDialog} onDismiss={() => setDeleteDialog(false)}>
          <Dialog.Title>{t("teachers.deleteTeacher")}</Dialog.Title>
          <Dialog.Content>
            <Text>{t("teachers.deleteConfirm")}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialog(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              onPress={confirmDelete}
              loading={deleting}
              textColor="#B00020"
            >
              {t("common.delete")}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

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

const styles = StyleSheet.create({
  content: {
    gap: 12,
  },
  name: {
    fontWeight: "700",
  },
  actions: {
    marginTop: 16,
    gap: 8,
  },
});
