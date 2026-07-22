import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  List,
  Text,
} from "react-native-paper";

import { EmptyState } from "@/components/common/empty-state";
import { ScreenWrapper } from "@/components/common/screen-wrapper";
import { STUDENTS_WITH_FEE_DUES } from "@/constants/mock-data";
import { studentService } from "@/modules/students/service";
import type { Student } from "@/types";

export default function FinancialScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const studentList = await studentService.getAll();
      setStudents(studentList);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const feeRecords = useMemo(
    () =>
      students.map((student) => ({
        ...student,
        hasDue: STUDENTS_WITH_FEE_DUES.has(student.id),
      })),
    [students],
  );

  const dueCount = feeRecords.filter((record) => record.hasDue).length;
  const clearCount = feeRecords.length - dueCount;

  return (
    <ScreenWrapper
      title={t("nav.financial")}
      action={
        <View style={styles.buttonsRow}>
          <Button
            mode="contained"
            compact
            onPress={() => router.push("/(app)/financial/donors" as never)}
          >
            {t("financial.donors")}
          </Button>
          <Button
            mode="outlined"
            compact
            onPress={() => router.push("/(app)/financial/fees" as never)}
          >
            {t("financial.fees")}
          </Button>
        </View>
      }
    >
      {loading ? (
        <ActivityIndicator style={styles.loader} />
      ) : students.length === 0 ? (
        <EmptyState message={t("financial.noRecords")} />
      ) : (
        <>
          <View style={styles.summaryRow}>
            <Card mode="elevated" style={styles.summaryCard}>
              <Card.Content>
                <Text variant="headlineMedium">{dueCount}</Text>
                <Text>{t("financial.dueFees")}</Text>
              </Card.Content>
            </Card>
            <Card mode="elevated" style={styles.summaryCard}>
              <Card.Content>
                <Text variant="headlineMedium">{clearCount}</Text>
                <Text>{t("financial.clearAccounts")}</Text>
              </Card.Content>
            </Card>
          </View>

          <View style={styles.actionRow}>
            <Button
              mode="contained"
              onPress={() => router.push("/(app)/financial/donations" as never)}
            >
              {t("financial.donations")}
            </Button>
            <Button
              mode="contained"
              onPress={() => router.push("/(app)/financial/salary" as never)}
            >
              {t("financial.salary")}
            </Button>
          </View>

          <FlatList
            data={feeRecords}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <List.Item
                title={item.name}
                description={`Contact: ${item.contactNumber}`}
                right={() => (
                  <Chip style={styles.chip} mode="outlined">
                    {item.hasDue ? t("financial.pending") : t("financial.paid")}
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
  buttonsRow: {
    flexDirection: "row",
    gap: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
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
