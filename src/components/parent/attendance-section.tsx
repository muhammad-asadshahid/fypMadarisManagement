import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { ActivityIndicator, List, Text } from "react-native-paper";

import { STATUS_COLORS } from "@/components/attendance/status-picker";
import { EmptyState } from "@/components/common/empty-state";
import { StatCard } from "@/components/common/stat-card";
import { attendanceService } from "@/modules/attendance/service";
import type { AttendanceRecord } from "@/types";

export function AttendanceSection({ studentId }: { studentId: string }) {
  const { t } = useTranslation();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const history = await attendanceService.getHistory(studentId);
      setRecords([...history].sort((a, b) => (a.date < b.date ? 1 : -1)));
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (loading) {
    return <ActivityIndicator style={styles.loader} />;
  }

  if (records.length === 0) {
    return <EmptyState message={t("parent.noAttendance")} />;
  }

  const present = records.filter((r) => r.status === "present").length;
  const absent = records.filter((r) => r.status === "absent").length;
  const leave = records.filter((r) => r.status === "leave").length;
  const rate = records.length
    ? Math.round((present / records.length) * 100)
    : 0;

  const statusLabels = {
    present: t("attendance.present"),
    absent: t("attendance.absent"),
    leave: t("attendance.leave"),
  } as const;

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.heading}>
        {t("parent.attendanceSummary")}
      </Text>
      <View style={styles.statsRow}>
        <StatCard label={t("attendance.present")} value={present} />
        <StatCard label={t("attendance.absent")} value={absent} />
        <StatCard label={t("attendance.leave")} value={leave} />
      </View>
      <StatCard label={t("parent.attendanceRate")} value={`${rate}%`} />

      <View style={styles.list}>
        {records.map((record) => (
          <List.Item
            key={record.id}
            title={record.date}
            right={() => (
              <Text
                style={[styles.status, { color: STATUS_COLORS[record.status] }]}
              >
                {statusLabels[record.status]}
              </Text>
            )}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  loader: {
    marginTop: 32,
  },
  heading: {
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  list: {
    marginTop: 4,
  },
  status: {
    alignSelf: "center",
    marginRight: 8,
    fontWeight: "600",
  },
});
