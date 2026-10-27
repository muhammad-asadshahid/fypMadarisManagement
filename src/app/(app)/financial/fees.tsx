import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, FlatList, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  Dialog,
  List,
  Portal,
  Text,
  TextInput,
} from "react-native-paper";

import { EmptyState } from "@/components/common/empty-state";
import { ScreenWrapper } from "@/components/common/screen-wrapper";
import { currentMonthKey, monthLabel } from "@/lib/months";
import { financialService } from "@/modules/financial/service";
import { studentService } from "@/modules/students/service";
import type { FeePayment, Student } from "@/types";

export default function FeesScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const month = currentMonthKey();

  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<Record<string, FeePayment>>({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Student | null>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [studentList, feePayments] = await Promise.all([
        studentService.getAll(),
        financialService.getFeePayments(month),
      ]);
      setStudents(studentList);
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

  const openMarkPaid = (student: Student) => {
    const existing = payments[student.id];
    setAmount(existing?.amount ? String(existing.amount) : "");
    setNote(existing?.note ?? "");
    setEditing(student);
  };

  const confirmPaid = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const saved = await financialService.setFeePayment(
        editing.id,
        month,
        true,
        Number(amount) || 0,
        note.trim() || undefined,
      );
      setPayments((prev) => ({ ...prev, [editing.id]: saved }));
      setEditing(null);
    } finally {
      setSaving(false);
    }
  };

  const markUnpaid = (student: Student) => {
    Alert.alert(t("financial.markUnpaid"), student.name, [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.confirm"),
        style: "destructive",
        onPress: async () => {
          const saved = await financialService.setFeePayment(
            student.id,
            month,
            false,
          );
          setPayments((prev) => ({ ...prev, [student.id]: saved }));
        },
      },
    ]);
  };

  const paidCount = students.filter((s) => payments[s.id]?.paid).length;
  const pendingCount = students.length - paidCount;

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
          <Text variant="titleMedium">
            {t("financial.feeStatusFor", { month: monthLabel(month) })}
          </Text>
          <View style={styles.summaryRow}>
            <Text>{`${t("financial.paid")}: ${paidCount}`}</Text>
            <Text>{`${t("financial.pending")}: ${pendingCount}`}</Text>
          </View>
        </Card.Content>
      </Card>

      {loading ? (
        <ActivityIndicator style={styles.loader} />
      ) : students.length === 0 ? (
        <EmptyState message={t("common.noData")} />
      ) : (
        <FlatList
          data={students}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const payment = payments[item.id];
            const isPaid = payment?.paid ?? false;
            return (
              <List.Item
                title={item.name}
                description={item.fatherName}
                right={() => (
                  <View style={styles.rowRight}>
                    {isPaid && payment?.amount ? (
                      <Text style={styles.amount}>{payment.amount}</Text>
                    ) : null}
                    <Chip
                      mode={isPaid ? "flat" : "outlined"}
                      onPress={() =>
                        isPaid ? markUnpaid(item) : openMarkPaid(item)
                      }
                    >
                      {isPaid ? t("financial.paid") : t("financial.pending")}
                    </Chip>
                  </View>
                )}
              />
            );
          }}
          ItemSeparatorComponent={() => <View style={styles.divider} />}
        />
      )}

      <Portal>
        <Dialog visible={!!editing} onDismiss={() => setEditing(null)}>
          <Dialog.Title>{t("financial.recordFee")}</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogSubtitle}>
              {`${editing?.name ?? ""} — ${monthLabel(month)}`}
            </Text>
            <TextInput
              label={t("financial.amount")}
              value={amount}
              onChangeText={setAmount}
              mode="outlined"
              keyboardType="numeric"
              style={styles.dialogInput}
            />
            <TextInput
              label={t("financial.note")}
              value={note}
              onChangeText={setNote}
              mode="outlined"
              style={styles.dialogInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEditing(null)}>
              {t("common.cancel")}
            </Button>
            <Button onPress={confirmPaid} loading={saving}>
              {t("common.save")}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12 },
  loader: { marginTop: 48 },
  divider: { height: 1, backgroundColor: "#E0E0E0" },
  summaryRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 8,
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  amount: {
    fontWeight: "600",
  },
  dialogSubtitle: {
    marginBottom: 12,
  },
  dialogInput: {
    marginTop: 8,
  },
});
