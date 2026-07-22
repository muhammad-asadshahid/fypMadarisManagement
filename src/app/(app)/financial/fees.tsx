import { studentService } from "@/modules/students/service";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, StyleSheet, View } from "react-native";
import { Button, Card, List, TextInput } from "react-native-paper";

import { ScreenWrapper } from "@/components/common/screen-wrapper";
import { financialService } from "@/modules/financial/service";
import type { FeeRecord } from "@/types";

export default function FeesScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [month, setMonth] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    financialService.getFeeRecords().then(setFees);
    studentService.getAll().then(setStudents);
  }, []);

  const handleRecord = async () => {
    if (!selectedStudent || !amount || !month) return;
    const fee = await financialService.recordFee({
      studentId: selectedStudent,
      month,
      amount: Number(amount),
      paid: true,
      date: new Date().toISOString(),
      note: note || undefined,
    });
    setFees((prev) => [fee, ...prev]);
    setSelectedStudent(null);
    setAmount("");
    setMonth("");
    setNote("");
  };

  return (
    <ScreenWrapper
      title={t("financial.fees")}
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
            label={t("students.name")}
            value={
              selectedStudent
                ? (students.find((s) => s.id === selectedStudent)?.name ?? "")
                : ""
            }
            disabled
            style={styles.input}
          />
          <FlatList
            data={students}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <List.Item
                title={item.name}
                description={item.fatherName}
                onPress={() => setSelectedStudent(item.id)}
                titleStyle={
                  selectedStudent === item.id ? styles.selected : undefined
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
            {t("financial.recordFee")}
          </Button>
        </Card.Content>
      </Card>
      <FlatList
        data={fees}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const studentName =
            students.find((s) => s.id === item.studentId)?.name ??
            t("common.noData");
          return (
            <List.Item
              title={`${studentName} • ${item.month}`}
              description={`${item.amount} • ${item.paid ? t("financial.paid") : t("financial.pending")} • ${new Date(item.date).toLocaleDateString()}`}
            />
          );
        }}
        ItemSeparatorComponent={() => <View style={styles.divider} />}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12 },
  input: { marginTop: 12 },
  button: { marginTop: 12 },
  divider: { height: 1, backgroundColor: "#E0E0E0" },
  selected: { fontWeight: "700" },
});
