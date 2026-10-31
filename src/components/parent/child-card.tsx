import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, View } from "react-native";
import { Card, Chip, Text, useTheme } from "react-native-paper";

import { STATUS_COLORS } from "@/components/attendance/status-picker";
import { PROGRAM_LABEL_KEYS } from "@/constants/programs";
import type { AttendanceStatus, Student } from "@/types";

interface ChildCardProps {
  student: Student;
  className: string;
  /** The student's status for today, or null when attendance isn't marked yet. */
  todayStatus?: AttendanceStatus | null;
  /** Whether the current month's fee is paid, or null when no record exists. */
  feePaid?: boolean | null;
}

export function ChildCard({
  student,
  className,
  todayStatus = null,
  feePaid = null,
}: ChildCardProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Pressable
      onPress={() =>
        router.push(`/(app)/parent-portal/${student.id}` as never)
      }
    >
      <Card mode="elevated" style={styles.card}>
        <Card.Content>
          <View style={styles.row}>
            <View style={styles.info}>
              <Text variant="titleMedium" style={styles.name}>
                {student.name}
              </Text>
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                {t("students.fatherName")}: {student.fatherName}
              </Text>
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                {className}
              </Text>
            </View>
            <View style={styles.chips}>
              <Chip compact mode="flat" style={styles.chip}>
                {t(PROGRAM_LABEL_KEYS[student.programType])}
              </Chip>
              <View style={styles.chipRow}>
                <Chip
                  compact
                  mode="outlined"
                  style={styles.chip}
                  textStyle={
                    todayStatus
                      ? { color: STATUS_COLORS[todayStatus] }
                      : undefined
                  }
                >
                  {todayStatus
                    ? t(`attendance.${todayStatus}`)
                    : t("parent.todayAttendance")}
                </Chip>
                {feePaid !== null ? (
                  <Chip
                    compact
                    mode={feePaid ? "flat" : "outlined"}
                    style={styles.chip}
                  >
                    {feePaid ? t("financial.paid") : t("financial.pending")}
                  </Chip>
                ) : null}
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontWeight: "600",
  },
  chips: {
    alignItems: "flex-end",
    gap: 4,
  },
  chipRow: {
    flexDirection: "row",
    gap: 4,
  },
  chip: {
    height: 28,
  },
});
