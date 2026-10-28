import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Chip, List, Text } from "react-native-paper";

import { STATUS_COLORS } from "@/components/attendance/status-picker";
import { EmptyState } from "@/components/common/empty-state";
import { ScreenWrapper } from "@/components/common/screen-wrapper";
import { attendanceService } from "@/modules/attendance/service";
import { studentService } from "@/modules/students/service";
import { teacherService } from "@/modules/teachers/service";
import { useAuthStore } from "@/store/authStore";
import type { AttendanceRecord, Class, Student } from "@/types";

export default function AttendanceHistoryScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const isTeacher = user?.role === "teacher";

  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [histories, setHistories] = useState<Record<string, AttendanceRecord[]>>(
    {},
  );
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [allClasses, allStudents] = await Promise.all([
        studentService.getClasses(),
        studentService.getAll(),
      ]);

      let scoped = allClasses;
      if (isTeacher && user?.teacherId) {
        const teacher = await teacherService.getById(user.teacherId);
        const ids = teacher?.classIds ?? [];
        scoped = allClasses.filter((cls) => ids.includes(cls.id));
      }

      const classId = selectedClassId || scoped[0]?.id || "";
      const roster = allStudents.filter((s) => s.classId === classId);

      const entries = await Promise.all(
        roster.map(async (student) => {
          const records = await attendanceService.getHistory(student.id);
          const sorted = [...records].sort((a, b) =>
            a.date < b.date ? 1 : -1,
          );
          return [student.id, sorted] as const;
        }),
      );

      setClasses(scoped);
      setStudents(allStudents);
      if (!selectedClassId && classId) setSelectedClassId(classId);
      setHistories(Object.fromEntries(entries));
    } finally {
      setLoading(false);
    }
  }, [isTeacher, selectedClassId, user?.teacherId]);

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

  const countsFor = (studentId: string) => {
    const records = histories[studentId] ?? [];
    return {
      present: records.filter((r) => r.status === "present").length,
      absent: records.filter((r) => r.status === "absent").length,
      leave: records.filter((r) => r.status === "leave").length,
    };
  };

  return (
    <ScreenWrapper
      title={t("attendance.history")}
      scrollable={false}
      action={
        <Button mode="text" onPress={() => router.back()}>
          {t("common.back")}
        </Button>
      }
    >
      <View style={styles.container}>
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
        ) : null}

        {loading ? (
          <ActivityIndicator style={styles.loader} />
        ) : roster.length === 0 ? (
          <EmptyState message={t("attendance.noRecords")} />
        ) : (
          <FlatList
            data={roster}
            keyExtractor={(item) => item.id}
            style={styles.list}
            renderItem={({ item }) => {
              const counts = countsFor(item.id);
              const records = histories[item.id] ?? [];
              return (
                <List.Accordion
                  id={item.id}
                  title={item.name}
                  description={`${statusLabels.present}: ${counts.present}   ${statusLabels.absent}: ${counts.absent}   ${statusLabels.leave}: ${counts.leave}`}
                >
                  {records.length === 0 ? (
                    <List.Item title={t("attendance.noRecords")} />
                  ) : (
                    records.map((rec) => (
                      <List.Item
                        key={rec.id}
                        title={rec.date}
                        right={() => (
                          <Text
                            style={[
                              styles.statusText,
                              { color: STATUS_COLORS[rec.status] },
                            ]}
                          >
                            {statusLabels[rec.status]}
                          </Text>
                        )}
                      />
                    ))
                  )}
                </List.Accordion>
              );
            }}
            ItemSeparatorComponent={() => <View style={styles.divider} />}
          />
        )}
      </View>
    </ScreenWrapper>
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
    marginBottom: 8,
  },
  loader: {
    marginTop: 48,
  },
  list: {
    flex: 1,
  },
  statusText: {
    alignSelf: "center",
    marginRight: 8,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
  },
});
