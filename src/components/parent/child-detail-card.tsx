import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { Card, Chip, Text, useTheme } from "react-native-paper";

import { PROGRAM_LABEL_KEYS } from "@/constants/programs";
import type { Student } from "@/types";

interface ChildDetailCardProps {
  student: Student;
  className: string;
}

function Row({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View style={styles.row}>
      <Text variant="bodyMedium" style={[styles.label, { color }]}>
        {label}
      </Text>
      <Text variant="bodyMedium" style={styles.value}>
        {value}
      </Text>
    </View>
  );
}

export function ChildDetailCard({ student, className }: ChildDetailCardProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const labelColor = theme.colors.onSurfaceVariant;

  return (
    <Card mode="elevated" style={styles.card}>
      <Card.Content style={styles.content}>
        <View style={styles.header}>
          <Text variant="titleLarge" style={styles.name}>
            {student.name}
          </Text>
          <Chip compact mode="flat">
            {t(PROGRAM_LABEL_KEYS[student.programType])}
          </Chip>
        </View>

        <Row
          label={t("students.fatherName")}
          value={student.fatherName}
          color={labelColor}
        />
        <Row label={t("students.class")} value={className} color={labelColor} />
        <Row
          label={t("students.admissionDate")}
          value={student.admissionDate}
          color={labelColor}
        />
        <Row
          label={t("students.contactNumber")}
          value={student.contactNumber}
          color={labelColor}
        />
        <Row
          label={t("students.hostelStatus")}
          value={
            student.hostelStatus
              ? t("students.hostelYes")
              : t("students.hostelNo")
          }
          color={labelColor}
        />
        {student.programType === "asri_taleem" ? (
          <Row
            label={t("asri.grade")}
            value={String(student.grade ?? 1)}
            color={labelColor}
          />
        ) : null}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 8,
  },
  content: {
    gap: 6,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 4,
  },
  name: {
    fontWeight: "700",
    flex: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  label: {
    flexShrink: 0,
  },
  value: {
    flex: 1,
    textAlign: "right",
    fontWeight: "500",
  },
});
