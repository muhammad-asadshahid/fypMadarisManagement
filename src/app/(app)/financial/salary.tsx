import { teacherService } from "@/modules/teachers/service";
import * as Print from "expo-print";
import { useFocusEffect, useRouter } from "expo-router";
import { shareAsync } from "expo-sharing";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, FlatList, Platform, StyleSheet, View } from "react-native";
import {
  Button,
  Card,
  Chip,
  Dialog,
  List,
  Paragraph,
  Portal,
  Text,
  TextInput,
} from "react-native-paper";

import { ScreenWrapper } from "@/components/common/screen-wrapper";
import { formatMonth, monthKey } from "@/lib/date";
import { financialService } from "@/modules/financial/service";
import type { SalaryPayment, Teacher } from "@/types";

export default function SalaryScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const currentMonth = monthKey();
  const [payments, setPayments] = useState<SalaryPayment[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [slipPayment, setSlipPayment] = useState<SalaryPayment | null>(null);

  const loadData = useCallback(async () => {
    const [teacherList, paymentList] = await Promise.all([
      teacherService.getAll(),
      financialService.getSalaryPayments(),
    ]);
    setTeachers(teacherList);
    setPayments(paymentList);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  // Teachers whose salary for the current month has already been paid.
  const paidTeacherIds = useMemo(
    () =>
      new Set(
        payments
          .filter((payment) => payment.month === currentMonth)
          .map((payment) => payment.teacherId),
      ),
    [payments, currentMonth],
  );

  const teacherName = (id: string) =>
    teachers.find((teacher) => teacher.id === id)?.name ?? t("common.noData");

  const selectTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher.id);
    setAmount(String(teacher.salary ?? 0));
  };

  const handleRecord = async () => {
    if (!selectedTeacher) {
      Alert.alert(t("common.error"), t("financial.teacherRequired"));
      return;
    }
    if (!amount) {
      Alert.alert(t("common.error"), t("financial.amountRequired"));
      return;
    }
    if (paidTeacherIds.has(selectedTeacher)) {
      Alert.alert(t("common.error"), t("financial.salaryAlreadyPaid"));
      return;
    }

    const payment = await financialService.recordSalaryPayment({
      teacherId: selectedTeacher,
      amount: Number(amount),
      month: currentMonth,
      date: new Date().toISOString(),
      note: note || undefined,
    });
    setPayments((prev) => [payment, ...prev]);
    setSelectedTeacher(null);
    setAmount("");
    setNote("");
  };

  const getSlipHtml = (payment: SalaryPayment) => {
    const name = teacherName(payment.teacherId);
    const dateTime = new Date(payment.date).toLocaleString();

    return `<!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${t("financial.salarySlip")}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
            h1 { margin-bottom: 16px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            td { padding: 8px; border: 1px solid #ddd; vertical-align: top; }
            .label { width: 180px; font-weight: 700; background: #f5f5f5; }
          </style>
        </head>
        <body>
          <h1>${t("financial.salarySlip")}</h1>
          <table>
            <tr><td class="label">${t("teachers.name")}</td><td>${name}</td></tr>
            <tr><td class="label">${t("financial.amountRequired")}</td><td>${payment.amount}</td></tr>
            <tr><td class="label">${t("financial.month")}</td><td>${formatMonth(payment.month)}</td></tr>
            <tr><td class="label">${t("common.date")}</td><td>${dateTime}</td></tr>
            <tr><td class="label">${t("financial.note")}</td><td>${payment.note ?? t("common.noData")}</td></tr>
          </table>
        </body>
      </html>`;
  };

  const openSalarySlip = (payment: SalaryPayment) => setSlipPayment(payment);
  const closeSalarySlip = () => setSlipPayment(null);

  const handlePrintSlip = async () => {
    if (!slipPayment) return;

    const html = getSlipHtml(slipPayment);

    try {
      if (Platform.OS === "web") {
        await Print.printAsync({ html });
        return;
      }

      const { uri } = await Print.printToFileAsync({ html });
      await shareAsync(uri, { mimeType: "application/pdf" });
    } catch (error: any) {
      console.warn(error);
      Alert.alert(t("common.error"), error?.message ?? String(error));
    }
  };

  return (
    <ScreenWrapper
      title={t("financial.salary")}
      action={
        <Button
          mode="text"
          onPress={() => router.push("/(app)/financial" as never)}
        >
          {t("common.back")}
        </Button>
      }
    >
      <Card mode="elevated" style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.monthLabel}>
            {`${t("financial.month")}: ${formatMonth(currentMonth)}`}
          </Text>
          <TextInput
            label={t("teachers.name")}
            value={selectedTeacher ? teacherName(selectedTeacher) : ""}
            disabled
            style={styles.input}
          />
          <FlatList
            data={teachers}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const paid = paidTeacherIds.has(item.id);
              return (
                <List.Item
                  title={item.name}
                  description={`${t("financial.salary")}: ${item.salary ?? 0}`}
                  onPress={() => !paid && selectTeacher(item)}
                  titleStyle={
                    selectedTeacher === item.id ? styles.selected : undefined
                  }
                  right={() => (
                    <Chip
                      mode="outlined"
                      icon={paid ? "check-circle" : "clock-outline"}
                      style={styles.chip}
                    >
                      {paid
                        ? t("financial.salaryPaid")
                        : t("financial.salaryUnpaid")}
                    </Chip>
                  )}
                />
              );
            }}
            ItemSeparatorComponent={() => <View style={styles.divider} />}
          />
          <TextInput
            label={t("financial.amountRequired")}
            value={amount}
            onChangeText={setAmount}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
          />
          <TextInput
            label={t("financial.note")}
            value={note}
            onChangeText={setNote}
            mode="outlined"
            multiline
            style={styles.input}
          />
          <Button mode="contained" onPress={handleRecord} style={styles.button}>
            {t("financial.recordSalary")}
          </Button>
        </Card.Content>
      </Card>

      <FlatList
        data={payments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <List.Item
            title={`${teacherName(item.teacherId)} • ${formatMonth(item.month)}`}
            description={`${item.amount} • ${new Date(item.date).toLocaleDateString()}`}
            right={() => (
              <Button
                compact
                mode="text"
                onPress={() => openSalarySlip(item)}
                style={styles.slipButton}
              >
                {t("financial.generateSalarySlip")}
              </Button>
            )}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.divider} />}
      />

      <Portal>
        <Dialog visible={!!slipPayment} onDismiss={closeSalarySlip}>
          <Dialog.Title>{t("financial.salarySlip")}</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              {`${t("teachers.name")}: ${teacherName(slipPayment?.teacherId ?? "")}`}
            </Paragraph>
            <Paragraph>
              {`${t("financial.amountRequired")}: ${slipPayment?.amount}`}
            </Paragraph>
            <Paragraph>
              {`${t("financial.month")}: ${slipPayment ? formatMonth(slipPayment.month) : ""}`}
            </Paragraph>
            <Paragraph>
              {`${t("common.date")}: ${slipPayment ? new Date(slipPayment.date).toLocaleString() : ""}`}
            </Paragraph>
            <Paragraph>
              {`${t("financial.note")}: ${slipPayment?.note ?? t("common.noData")}`}
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={closeSalarySlip}>{t("common.cancel")}</Button>
            <Button onPress={handlePrintSlip}>
              {t("financial.printSave")}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12 },
  monthLabel: { marginBottom: 4 },
  input: { marginTop: 12 },
  button: { marginTop: 12 },
  divider: { height: 1, backgroundColor: "#E0E0E0" },
  selected: { fontWeight: "700" },
  chip: { alignSelf: "center", marginRight: 8 },
  slipButton: {
    alignSelf: "center",
  },
});
