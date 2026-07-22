import { teacherService } from "@/modules/teachers/service";
import * as Print from "expo-print";
import { useRouter } from "expo-router";
import { shareAsync } from "expo-sharing";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, FlatList, Platform, StyleSheet, View } from "react-native";
import {
  Button,
  Card,
  Dialog,
  List,
  Paragraph,
  Portal,
  TextInput,
} from "react-native-paper";

import { ScreenWrapper } from "@/components/common/screen-wrapper";
import { financialService } from "@/modules/financial/service";
import type { SalaryPayment } from "@/types";

export default function SalaryScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [payments, setPayments] = useState<SalaryPayment[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [month, setMonth] = useState("");
  const [note, setNote] = useState("");
  const [slipPayment, setSlipPayment] = useState<SalaryPayment | null>(null);

  useEffect(() => {
    financialService.getSalaryPayments().then(setPayments);
    teacherService.getAll().then(setTeachers);
  }, []);

  const handleRecord = async () => {
    if (!selectedTeacher || !amount || !month) {
      Alert.alert(
        t("common.error"),
        !selectedTeacher
          ? t("financial.teacherRequired")
          : !amount
            ? t("financial.amountRequired")
            : t("financial.monthRequired"),
      );
      return;
    }

    const payment = await financialService.recordSalaryPayment({
      teacherId: selectedTeacher,
      amount: Number(amount),
      month,
      date: new Date().toISOString(),
      note: note || undefined,
    });
    setPayments((prev) => [payment, ...prev]);
    setSelectedTeacher(null);
    setAmount("");
    setMonth("");
    setNote("");
  };

  const getSlipHtml = (payment: SalaryPayment) => {
    const teacher = teachers.find((t) => t.id === payment.teacherId);
    const teacherName = teacher?.name ?? t("common.noData");
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
            <tr><td class="label">${t("teachers.name")}</td><td>${teacherName}</td></tr>
            <tr><td class="label">${t("financial.amountRequired")}</td><td>${payment.amount}</td></tr>
            <tr><td class="label">${t("financial.month")}</td><td>${payment.month}</td></tr>
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
          <TextInput
            label={t("teachers.name")}
            value={
              selectedTeacher
                ? (teachers.find((t) => t.id === selectedTeacher)?.name ?? "")
                : ""
            }
            disabled
            style={styles.input}
          />
          <FlatList
            data={teachers}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <List.Item
                title={item.name}
                description={item.subjects?.join(", ")}
                onPress={() => setSelectedTeacher(item.id)}
                titleStyle={
                  selectedTeacher === item.id ? styles.selected : undefined
                }
              />
            )}
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
            label={t("financial.month")}
            value={month}
            onChangeText={setMonth}
            mode="outlined"
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
        renderItem={({ item }) => {
          const teacherName =
            teachers.find((t) => t.id === item.teacherId)?.name ??
            t("common.noData");
          return (
            <List.Item
              title={`${teacherName} • ${item.month}`}
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
          );
        }}
        ItemSeparatorComponent={() => <View style={styles.divider} />}
      />

      <Portal>
        <Dialog visible={!!slipPayment} onDismiss={closeSalarySlip}>
          <Dialog.Title>{t("financial.salarySlip")}</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              {`${t("teachers.name")}: ${teachers.find((t) => t.id === slipPayment?.teacherId)?.name ?? t("common.noData")}`}
            </Paragraph>
            <Paragraph>
              {`${t("financial.amountRequired")}: ${slipPayment?.amount}`}
            </Paragraph>
            <Paragraph>
              {`${t("financial.month")}: ${slipPayment?.month}`}
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
  input: { marginTop: 12 },
  button: { marginTop: 12 },
  divider: { height: 1, backgroundColor: "#E0E0E0" },
  selected: { fontWeight: "700" },
  slipButton: {
    alignSelf: "center",
  },
});
