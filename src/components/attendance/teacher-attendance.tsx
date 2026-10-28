import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  Snackbar,
  Text,
} from "react-native-paper";

import { DateStepper } from "@/components/attendance/date-stepper";
import { StatusPicker } from "@/components/attendance/status-picker";
import { EmptyState } from "@/components/common/empty-state";
import { ScreenWrapper } from "@/components/common/screen-wrapper";
import {
  attendanceService,
  todayStr,
  type DailyEntry,
} from "@/modules/attendance/service";
import { studentService } from "@/modules/students/service";
import { teacherService } from "@/modules/teachers/service";
import { useAuthStore } from "@/store/authStore";
import type { AttendanceStatus, Class, Student } from "@/types";

export function TeacherAttendance() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);

  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [date, setDate] = useState(todayStr());
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [allClasses, allStudents] = await Promise.all([
        studentService.getClasses(),
        studentService.getAll(),
      ]);
      const teacher = user?.teacherId
        ? await teacherService.getById(user.teacherId)
        : null;
      const classIds = teacher?.classIds ?? [];
      const scoped = allClasses.filter((cls) => classIds.includes(cls.id));

      const classId = selectedClassId || scoped[0]?.id || "";
      const records = classId
        ? await attendanceService.getByDateAndClass(date, classId)
        : [];

      setClasses(scoped);
      setStudents(allStudents);
      if (!selectedClassId && classId) setSelectedClassId(classId);
      setStatuses(
        Object.fromEntries(
          records.map((r) => [r.studentId, r.status] as const),
        ) as Record<string, AttendanceStatus>,
      );
    } finally {
      setLoading(false);
    }
  }, [date, selectedClassId, user?.teacherId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const roster = useMemo(
    () => students.filter((s) => s.classId === selectedClassId),
    [students, selectedClassId],
  );

  const statusLabels = {
    present: t("attendance.present"),
    absent: t("attendance.absent"),
    leave: t("attendance.leave"),
  } as const;

  const statusFor = (studentId: string): AttendanceStatus =>
    statuses[studentId] ?? "present";

  const summary = useMemo(
    () => ({
      present: roster.filter((s) => statusFor(s.id) === "present").length,
      absent: roster.filter((s) => statusFor(s.id) === "absent").length,
      leave: roster.filter((s) => statusFor(s.id) === "leave").length,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [roster, statuses],
  );

  const setStatus = (studentId: string, status: AttendanceStatus) =>
    setStatuses((prev) => ({ ...prev, [studentId]: status }));

  const save = async () => {
    if (!selectedClassId) return;
    setSaving(true);
    try {
      const entries: DailyEntry[] = roster.map((student) => ({
        student,
        status: statusFor(student.id),
      }));
      await attendanceService.mark(
        date,
        selectedClassId,
        entries,
        user?.teacherId ?? user?.id ?? "teacher",
      );
      setSnackbar(t("attendance.saved"));
    } catch {
      setSnackbar(t("common.error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenWrapper title={t("nav.attendance")} scrollable={false}>
      <View style={styles.container}>
        <View style={styles.navRow}>
          <Button
            compact
            mode="outlined"
            icon="history"
            onPress={() => router.push("/(app)/attendance/history" as never)}
          >
            {t("attendance.history")}
          </Button>
          <Button
            compact
            mode="outlined"
            icon="file-chart"
            onPress={() => router.push("/(app)/attendance/reports" as never)}
          >
            {t("attendance.monthlyReport")}
          </Button>
        </View>

        {loading ? (
          <ActivityIndicator style={styles.loader} />
        ) : classes.length === 0 ? (
          <EmptyState message={t("attendance.noClasses")} />
        ) : (
          <>
            {classes.length > 1 ? (
              <View style={styles.classList}>
                {classes.map((cls) => (
                  <Chip
                    key={cls.id}
                    selected={cls.id === selectedClassId}
                    showSelectedOverlay
                    onPress={() => setSelectedClassId(cls.id)}
                  >
                    {cls.name}
                  </Chip>
                ))}
              </View>
            ) : (
              <Text variant="titleMedium" style={styles.className}>
                {classes[0]?.name}
              </Text>
            )}

            <DateStepper
              value={date}
              onChange={setDate}
              todayLabel={t("attendance.today")}
            />

            <View style={styles.summaryRow}>
              <SummaryCard label={statusLabels.present} value={summary.present} />
              <SummaryCard label={statusLabels.absent} value={summary.absent} />
              <SummaryCard label={statusLabels.leave} value={summary.leave} />
            </View>

            <FlatList
              data={roster}
              keyExtractor={(item) => item.id}
              style={styles.list}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={<EmptyState message={t("common.noData")} />}
              renderItem={({ item }) => (
                <View style={styles.row}>
                  <View style={styles.rowText}>
                    <Text variant="bodyLarge">{item.name}</Text>
                    <Text variant="bodySmall" style={styles.sub}>
                      {item.fatherName}
                    </Text>
                  </View>
                  <StatusPicker
                    value={statusFor(item.id)}
                    onChange={(status) => setStatus(item.id, status)}
                    labels={statusLabels}
                  />
                </View>
              )}
              ItemSeparatorComponent={() => <View style={styles.divider} />}
            />

            <Button
              mode="contained"
              icon="content-save"
              loading={saving}
              disabled={saving || roster.length === 0}
              onPress={save}
              style={styles.saveButton}
            >
              {t("attendance.save")}
            </Button>
          </>
        )}
      </View>

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

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <Card style={styles.summaryCard} mode="elevated">
      <Card.Content style={styles.summaryContent}>
        <Text variant="headlineSmall">{value}</Text>
        <Text variant="bodySmall">{label}</Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  loader: {
    marginTop: 48,
  },
  classList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  className: {
    fontWeight: "600",
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 12,
    marginVertical: 12,
  },
  summaryCard: {
    flex: 1,
  },
  summaryContent: {
    alignItems: "center",
    gap: 2,
    paddingVertical: 8,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  rowText: {
    flex: 1,
    paddingRight: 8,
  },
  sub: {
    opacity: 0.6,
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  saveButton: {
    marginTop: 12,
  },
});
