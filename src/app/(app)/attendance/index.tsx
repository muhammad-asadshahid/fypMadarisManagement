import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, StyleSheet, View } from "react-native";
import { ActivityIndicator, Card, Chip, List, Text } from "react-native-paper";

import { EmptyState } from "@/components/common/empty-state";
import { ScreenWrapper } from "@/components/common/screen-wrapper";
import { PROGRAM_LABEL_KEYS } from "@/constants/programs";
import { studentService } from "@/modules/students/service";
import type { AttendanceStatus, Class, Student } from "@/types";

const STATUS_ORDER: AttendanceStatus[] = ["present", "absent", "leave"];

export default function AttendanceScreen() {
  const { t } = useTranslation();
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const [studentList, classList] = await Promise.all([
        studentService.getAll(),
        studentService.getClasses(),
      ]);
      setStudents(studentList);
      setClasses(classList);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAttendance();
    }, [loadAttendance]),
  );

  const attendance = useMemo(() => {
    return students.map((student, index) => ({
      ...student,
      status: STATUS_ORDER[index % STATUS_ORDER.length],
      className: classes.find((cls) => cls.id === student.classId)?.name ?? "—",
    }));
  }, [classes, students]);

  const summary = useMemo(
    () => ({
      present: attendance.filter((item) => item.status === "present").length,
      absent: attendance.filter((item) => item.status === "absent").length,
      leave: attendance.filter((item) => item.status === "leave").length,
    }),
    [attendance],
  );

  const statusLabels = {
    present: t("attendance.present"),
    absent: t("attendance.absent"),
    leave: t("attendance.leave"),
  } as const;

  return (
    <ScreenWrapper title={t("nav.attendance")}>
      {loading ? (
        <ActivityIndicator style={styles.loader} />
      ) : attendance.length === 0 ? (
        <EmptyState message={t("common.noData")} />
      ) : (
        <>
          <View style={styles.summaryRow}>
            <Card style={styles.summaryCard} mode="elevated">
              <Card.Content style={styles.summaryContent}>
                <Text variant="headlineLarge">{summary.present}</Text>
                <Text>{statusLabels.present}</Text>
              </Card.Content>
            </Card>
            <Card style={styles.summaryCard} mode="elevated">
              <Card.Content style={styles.summaryContent}>
                <Text variant="headlineLarge">{summary.absent}</Text>
                <Text>{statusLabels.absent}</Text>
              </Card.Content>
            </Card>
            <Card style={styles.summaryCard} mode="elevated">
              <Card.Content style={styles.summaryContent}>
                <Text variant="headlineLarge">{summary.leave}</Text>
                <Text>{statusLabels.leave}</Text>
              </Card.Content>
            </Card>
          </View>

          <FlatList
            data={attendance}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <List.Item
                title={item.name}
                description={`${t(PROGRAM_LABEL_KEYS[item.programType])} • ${item.className}`}
                right={() => (
                  <Chip style={styles.chip} mode="outlined">
                    {statusLabels[item.status]}
                  </Chip>
                )}
              />
            )}
            ItemSeparatorComponent={() => <View style={styles.divider} />}
          />
        </>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  loader: {
    marginTop: 48,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
  },
  summaryContent: {
    alignItems: "center",
    gap: 4,
  },
  chip: {
    alignSelf: "center",
    marginRight: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
  },
});
