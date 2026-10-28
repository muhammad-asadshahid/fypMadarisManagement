import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Card, List, Text } from "react-native-paper";

import { DateStepper } from "@/components/attendance/date-stepper";
import { STATUS_COLORS } from "@/components/attendance/status-picker";
import { EmptyState } from "@/components/common/empty-state";
import { ScreenWrapper } from "@/components/common/screen-wrapper";
import { attendanceService, todayStr } from "@/modules/attendance/service";
import { studentService } from "@/modules/students/service";
import type { AttendanceRecord, Class } from "@/types";

export function AdminAttendance() {
  const { t } = useTranslation();
  const [classes, setClasses] = useState<Class[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [date, setDate] = useState(todayStr());
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [classList, dayRecords] = await Promise.all([
        studentService.getClasses(),
        attendanceService.getByDate(date),
      ]);
      setClasses(classList);
      setRecords(dayRecords);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const summary = useMemo(() => {
    const counts = { present: 0, absent: 0, leave: 0 };
    records.forEach((r) => {
      counts[r.status] += 1;
    });
    return { ...counts, total: records.length };
  }, [records]);

  const breakdown = useMemo(
    () =>
      classes.map((cls) => {
        const inClass = records.filter((r) => r.classId === cls.id);
        return {
          cls,
          present: inClass.filter((r) => r.status === "present").length,
          absent: inClass.filter((r) => r.status === "absent").length,
          leave: inClass.filter((r) => r.status === "leave").length,
          total: inClass.length,
        };
      }),
    [classes, records],
  );

  const statusLabels = {
    present: t("attendance.present"),
    absent: t("attendance.absent"),
    leave: t("attendance.leave"),
  } as const;

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

        <DateStepper
          value={date}
          onChange={setDate}
          todayLabel={t("attendance.today")}
        />

        {loading ? (
          <ActivityIndicator style={styles.loader} />
        ) : (
          <>
            <View style={styles.summaryRow}>
              <SummaryCard
                label={statusLabels.present}
                value={summary.present}
                color={STATUS_COLORS.present}
              />
              <SummaryCard
                label={statusLabels.absent}
                value={summary.absent}
                color={STATUS_COLORS.absent}
              />
              <SummaryCard
                label={statusLabels.leave}
                value={summary.leave}
                color={STATUS_COLORS.leave}
              />
            </View>
            <Text variant="bodyMedium" style={styles.totalLine}>
              {`${t("attendance.totalMarked")}: ${summary.total}`}
            </Text>

            <Text variant="titleMedium" style={styles.heading}>
              {t("attendance.classBreakdown")}
            </Text>

            <FlatList
              data={breakdown}
              keyExtractor={(item) => item.cls.id}
              style={styles.list}
              ListEmptyComponent={
                <EmptyState message={t("attendance.noRecords")} />
              }
              renderItem={({ item }) => (
                <List.Item
                  title={item.cls.name}
                  description={`${statusLabels.present}: ${item.present}   ${statusLabels.absent}: ${item.absent}   ${statusLabels.leave}: ${item.leave}`}
                  right={() => (
                    <Text variant="titleMedium" style={styles.count}>
                      {item.total}
                    </Text>
                  )}
                />
              )}
              ItemSeparatorComponent={() => <View style={styles.divider} />}
            />
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
  navRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
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
  totalLine: {
    opacity: 0.7,
    marginBottom: 12,
  },
  heading: {
    fontWeight: "600",
    marginBottom: 4,
  },
  list: {
    flex: 1,
  },
  count: {
    alignSelf: "center",
    marginRight: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
  },
});
