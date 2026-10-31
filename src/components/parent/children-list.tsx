import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";

import { EmptyState } from "@/components/common/empty-state";
import { ScreenWrapper } from "@/components/common/screen-wrapper";
import { ChildCard } from "@/components/parent/child-card";
import { currentMonthKey } from "@/lib/months";
import { attendanceService, todayStr } from "@/modules/attendance/service";
import { financialService } from "@/modules/financial/service";
import { studentService } from "@/modules/students/service";
import { useAuthStore } from "@/store/authStore";
import type { AttendanceStatus, Class, Student } from "@/types";

interface ChildrenListProps {
  title: string;
  header?: ReactNode;
}

export function ChildrenList({ title, header }: ChildrenListProps) {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);

  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [todayStatus, setTodayStatus] = useState<
    Record<string, AttendanceStatus>
  >({});
  const [feePaid, setFeePaid] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [allStudents, allClasses, dayRecords, feePayments] =
        await Promise.all([
          studentService.getAll(),
          studentService.getClasses(),
          attendanceService.getByDate(todayStr()),
          financialService.getFeePayments(currentMonthKey()),
        ]);

      setStudents(allStudents);
      setClasses(allClasses);
      setTodayStatus(
        Object.fromEntries(dayRecords.map((r) => [r.studentId, r.status])),
      );
      setFeePaid(
        Object.fromEntries(feePayments.map((p) => [p.studentId, p.paid])),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const children = useMemo(
    () =>
      user?.parentStudentIds
        ? students.filter((s) => user.parentStudentIds?.includes(s.id))
        : [],
    [students, user?.parentStudentIds],
  );

  const classNameOf = (student: Student) =>
    classes.find((c) => c.id === student.classId)?.name ?? "—";

  if (loading) {
    return (
      <ScreenWrapper title={title}>
        <ActivityIndicator style={styles.loader} />
      </ScreenWrapper>
    );
  }

  if (children.length === 0) {
    return (
      <ScreenWrapper title={title}>
        <EmptyState message={t("parent.noChildren")} />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper title={title}>
      {header}
      <Text variant="titleMedium" style={styles.heading}>
        {t("parent.myChildren")}
      </Text>
      {children.map((student) => (
        <ChildCard
          key={student.id}
          student={student}
          className={classNameOf(student)}
          todayStatus={todayStatus[student.id] ?? null}
          feePaid={feePaid[student.id] ?? null}
        />
      ))}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  loader: {
    marginTop: 48,
  },
  heading: {
    fontWeight: "600",
    marginBottom: 8,
  },
});
