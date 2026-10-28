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
import { currentMonthKey, monthLabel } from "@/lib/months";
import { financialService } from "@/modules/financial/service";
import { studentService } from "@/modules/students/service";
import { teacherService } from "@/modules/teachers/service";
import type { FeePayment, SalaryPayment, Student, Teacher } from "@/types";

export default function FinancialScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const month = currentMonthKey();
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [salaryPayments, setSalaryPayments] = useState<SalaryPayment[]>([]);
  const [payments, setPayments] = useState<Record<string, FeePayment>>({});
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [studentList, teacherList, salaryList, feePayments] =
        await Promise.all([
          studentService.getAll(),
          teacherService.getAll(),
          financialService.getSalaryPayments(),
          financialService.getFeePayments(month),
        ]);
      setStudents(studentList);
      setTeachers(teacherList);
      setSalaryPayments(salaryList);
      setPayments(
        Object.fromEntries(feePayments.map((p) => [p.studentId, p])),
      );
    } finally {
      setLoading(false);
    }
  }, [month]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const feeStatuses = useMemo(
    () =>
      students.map((student) => ({
        ...student,
        hasDue: !(payments[student.id]?.paid ?? false),
      })),
    [students, payments],
  );

  const dueCount = feeStatuses.filter((record) => record.hasDue).length;
  const clearCount = feeStatuses.length - dueCount;

  const salaryStatus = useMemo(
    () =>
      teachers.map((teacher) => ({
        teacher,
        paid: salaryPayments.some(
          (payment) =>
            payment.teacherId === teacher.id && payment.month === month,
        ),
      })),
    [teachers, salaryPayments, month],
  );
  const unpaidSalaryCount = salaryStatus.filter((row) => !row.paid).length;
  const paidSalaryCount = salaryStatus.length - unpaidSalaryCount;

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
          <Text style={styles.monthLabel}>
            {t("financial.feeStatusFor", { month: monthLabel(month) })}
          </Text>
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

          <Text variant="titleMedium" style={styles.sectionTitle}>
            {`${t("financial.salary")} • ${monthLabel(month)}`}
          </Text>
          <View style={styles.summaryRow}>
            <Card mode="elevated" style={styles.summaryCard}>
              <Card.Content>
                <Text variant="headlineMedium">{paidSalaryCount}</Text>
                <Text>{t("financial.salaryPaid")}</Text>
              </Card.Content>
            </Card>
            <Card mode="elevated" style={styles.summaryCard}>
              <Card.Content>
                <Text variant="headlineMedium">{unpaidSalaryCount}</Text>
                <Text>{t("financial.salaryUnpaid")}</Text>
              </Card.Content>
            </Card>
          </View>

          {salaryStatus.map(({ teacher, paid }) => (
            <List.Item
              key={teacher.id}
              title={teacher.name}
              description={`${t("financial.salary")}: ${teacher.salary ?? 0}`}
              right={() => (
                <Chip
                  style={styles.chip}
                  mode="outlined"
                  icon={paid ? "check-circle" : "clock-outline"}
                >
                  {paid
                    ? t("financial.salaryPaid")
                    : t("financial.salaryUnpaid")}
                </Chip>
              )}
            />
          ))}

          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t("financial.fees")}
          </Text>
          <FlatList
            data={feeStatuses}
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
  monthLabel: {
    marginBottom: 12,
    fontWeight: "600",
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
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
  },
});
