import * as Print from "expo-print";
import { shareAsync } from "expo-sharing";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, FlatList, Platform, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  List,
  Text,
} from "react-native-paper";

import { MonthStepper } from "@/components/attendance/month-stepper";
import { STATUS_COLORS } from "@/components/attendance/status-picker";
import { EmptyState } from "@/components/common/empty-state";
import { ScreenWrapper } from "@/components/common/screen-wrapper";
import { currentMonthKey, monthLabel } from "@/lib/months";
import { attendanceService } from "@/modules/attendance/service";
import { studentService } from "@/modules/students/service";
import { teacherService } from "@/modules/teachers/service";
import { useAuthStore } from "@/store/authStore";
import type { AttendanceRecord, Class, Student } from "@/types";

export default function AttendanceReportScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const isTeacher = user?.role === "teacher";

  const [month, setMonth] = useState(currentMonthKey());
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [allClasses, allStudents] = await Promise.all([
        studentService.getClasses(),
        studentService.getAll(),
      ]);

      let scopedClasses = allClasses;
      let defaultClassId = "";
      if (isTeacher && user?.teacherId) {
        const teacher = await teacherService.getById(user.teacherId);
        const ids = teacher?.classIds ?? [];
        scopedClasses = allClasses.filter((cls) => ids.includes(cls.id));
        defaultClassId = scopedClasses[0]?.id ?? "";
      }

      // Admins may leave the class empty to report across every class.
      const classId = isTeacher ? selectedClassId || defaultClassId : selectedClassId;
      const monthRecords = await attendanceService.getByMonth(
        month,
        classId || undefined,
      );

      setClasses(scopedClasses);
      setStudents(allStudents);
      if (isTeacher && !selectedClassId && defaultClassId)
        setSelectedClassId(defaultClassId);
      setRecords(monthRecords);
    } finally {
      setLoading(false);
    }
  }, [isTeacher, month, selectedClassId, user?.teacherId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const rows = useMemo(() => {
    const inScope = selectedClassId
      ? students.filter((s) => s.classId === selectedClassId)
      : students;
    return inScope.map((student) => {
      const recs = records.filter((r) => r.studentId === student.id);
      const present = recs.filter((r) => r.status === "present").length;
      const absent = recs.filter((r) => r.status === "absent").length;
      const leave = recs.filter((r) => r.status === "leave").length;
      const total = recs.length;
      const rate = total ? Math.round((present / total) * 100) : 0;
      return { student, present, absent, leave, total, rate };
    });
  }, [students, records, selectedClassId]);

  const totals = useMemo(
    () =>
      rows.reduce(
        (acc, r) => ({
          present: acc.present + r.present,
          absent: acc.absent + r.absent,
          leave: acc.leave + r.leave,
          total: acc.total + r.total,
        }),
        { present: 0, absent: 0, leave: 0, total: 0 },
      ),
    [rows],
  );

  const statusLabels = {
    present: t("attendance.present"),
    absent: t("attendance.absent"),
    leave: t("attendance.leave"),
  } as const;

  const scopeName = selectedClassId
    ? (classes.find((c) => c.id === selectedClassId)?.name ?? "")
    : t("attendance.allClasses");

  const buildHtml = () => {
    const reportRows = rows
      .map(
        (r) =>
          `<tr><td>${r.student.name}</td><td>${r.student.fatherName}</td><td>${r.present}</td><td>${r.absent}</td><td>${r.leave}</td><td>${r.total}</td><td>${r.rate}%</td></tr>`,
      )
      .join("");

    return `<!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${t("attendance.monthlyReport")}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
            h1 { margin-bottom: 4px; }
            .sub { color: #555; margin-bottom: 16px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { padding: 8px; border: 1px solid #ddd; text-align: left; }
            th { background: #f5f5f5; }
          </style>
        </head>
        <body>
          <h1>${t("attendance.monthlyReport")}</h1>
          <div class="sub">${monthLabel(month)} • ${scopeName}</div>
          <table>
            <thead>
              <tr>
                <th>${t("students.name")}</th>
                <th>${t("students.fatherName")}</th>
                <th>${statusLabels.present}</th>
                <th>${statusLabels.absent}</th>
                <th>${statusLabels.leave}</th>
                <th>${t("attendance.total")}</th>
                <th>${t("attendance.attendanceRate")}</th>
              </tr>
            </thead>
            <tbody>${reportRows}</tbody>
          </table>
        </body>
      </html>`;
  };

  const handlePrint = async () => {
    const html = buildHtml();
    try {
      if (Platform.OS === "web") {
        await Print.printAsync({ html });
        return;
      }
      const { uri } = await Print.printToFileAsync({ html });
      await shareAsync(uri, { mimeType: "application/pdf" });
    } catch (error) {
      Alert.alert(t("common.error"), (error as Error)?.message ?? String(error));
    }
  };

  return (
    <ScreenWrapper
      title={t("attendance.monthlyReport")}
      scrollable={false}
      action={
        <Button mode="text" onPress={() => router.back()}>
          {t("common.back")}
        </Button>
      }
    >
      <View style={styles.container}>
        <MonthStepper value={month} onChange={setMonth} />

        <View style={styles.classList}>
          {!isTeacher ? (
            <Chip
              selected={selectedClassId === ""}
              showSelectedOverlay
              onPress={() => setSelectedClassId("")}
            >
              {t("attendance.allClasses")}
            </Chip>
          ) : null}
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

        {loading ? (
          <ActivityIndicator style={styles.loader} />
        ) : (
          <>
            <View style={styles.summaryRow}>
              <SummaryCard
                label={statusLabels.present}
                value={totals.present}
                color={STATUS_COLORS.present}
              />
              <SummaryCard
                label={statusLabels.absent}
                value={totals.absent}
                color={STATUS_COLORS.absent}
              />
              <SummaryCard
                label={statusLabels.leave}
                value={totals.leave}
                color={STATUS_COLORS.leave}
              />
            </View>

            <FlatList
              data={rows}
              keyExtractor={(item) => item.student.id}
              style={styles.list}
              ListEmptyComponent={
                <EmptyState message={t("attendance.noRecords")} />
              }
              renderItem={({ item }) => (
                <List.Item
                  title={item.student.name}
                  description={`${statusLabels.present}: ${item.present}   ${statusLabels.absent}: ${item.absent}   ${statusLabels.leave}: ${item.leave}`}
                  right={() => (
                    <Text variant="titleMedium" style={styles.rate}>
                      {`${item.rate}%`}
                    </Text>
                  )}
                />
              )}
              ItemSeparatorComponent={() => <View style={styles.divider} />}
            />

            <Button
              mode="contained"
              icon="printer"
              onPress={handlePrint}
              disabled={rows.length === 0}
              style={styles.printButton}
            >
              {t("attendance.print")}
            </Button>
          </>
        )}
      </View>
    </ScreenWrapper>
  );
}

function SummaryCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <Card style={styles.summaryCard} mode="elevated">
      <Card.Content style={styles.summaryContent}>
        <Text variant="headlineSmall" style={{ color, fontWeight: "700" }}>
          {value}
        </Text>
        <Text variant="bodySmall">{label}</Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  classList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  loader: {
    marginTop: 48,
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
  rate: {
    alignSelf: "center",
    marginRight: 8,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  printButton: {
    marginTop: 12,
  },
});
