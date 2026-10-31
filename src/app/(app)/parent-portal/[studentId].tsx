import { Redirect, router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";
import {
  ActivityIndicator,
  Button,
  SegmentedButtons,
} from "react-native-paper";

import { ScreenWrapper } from "@/components/common/screen-wrapper";
import { AttendanceSection } from "@/components/parent/attendance-section";
import { ChildDetailCard } from "@/components/parent/child-detail-card";
import { FeeSection } from "@/components/parent/fee-section";
import { ProgressSection } from "@/components/parent/progress-section";
import { studentService } from "@/modules/students/service";
import { useAuthStore } from "@/store/authStore";
import type { Student } from "@/types";

type Tab = "attendance" | "progress" | "fees";

export default function ChildDetailScreen() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const { studentId } = useLocalSearchParams<{ studentId: string }>();

  const [student, setStudent] = useState<Student | null>(null);
  const [className, setClassName] = useState("—");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [tab, setTab] = useState<Tab>("attendance");

  const load = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const [found, classes] = await Promise.all([
        studentService.getById(studentId),
        studentService.getClasses(),
      ]);
      // A parent may only open a child linked to their own account.
      if (!found || !user?.parentStudentIds?.includes(found.id)) {
        setNotFound(true);
        return;
      }
      setStudent(found);
      setClassName(classes.find((c) => c.id === found.classId)?.name ?? "—");
    } finally {
      setLoading(false);
    }
  }, [studentId, user?.parentStudentIds]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (notFound) {
    return <Redirect href={"/(app)/parent-portal" as never} />;
  }

  if (loading || !student) {
    return (
      <ScreenWrapper title={t("parent.title")}>
        <ActivityIndicator style={styles.loader} />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper
      title={student.name}
      action={
        <Button mode="text" onPress={() => router.back()}>
          {t("common.back")}
        </Button>
      }
    >
      <ChildDetailCard student={student} className={className} />

      <SegmentedButtons
        value={tab}
        onValueChange={(value) => setTab(value as Tab)}
        buttons={[
          { value: "attendance", label: t("parent.attendanceTab") },
          { value: "progress", label: t("parent.progressTab") },
          { value: "fees", label: t("parent.feesTab") },
        ]}
      />

      {tab === "attendance" ? (
        <AttendanceSection studentId={student.id} />
      ) : null}
      {tab === "progress" ? <ProgressSection student={student} /> : null}
      {tab === "fees" ? <FeeSection studentId={student.id} /> : null}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  loader: {
    marginTop: 48,
  },
});
