import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { ActivityIndicator, Card, Chip, List, Text } from "react-native-paper";

import { EmptyState } from "@/components/common/empty-state";
import { currentMonthKey, monthLabel } from "@/lib/months";
import { financialService } from "@/modules/financial/service";
import type { FeePayment } from "@/types";

export function FeeSection({ studentId }: { studentId: string }) {
  const { t } = useTranslation();
  const month = currentMonthKey();
  const [payments, setPayments] = useState<FeePayment[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const all = await financialService.getFeePayments();
      setPayments(
        all
          .filter((p) => p.studentId === studentId)
          .sort((a, b) => (a.month < b.month ? 1 : -1)),
      );
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

  if (payments.length === 0) {
    return <EmptyState message={t("parent.noFees")} />;
  }

  const current = payments.find((p) => p.month === month);
  const isPaid = current?.paid ?? false;

  return (
    <View style={styles.container}>
      <Card mode="elevated">
        <Card.Content style={styles.cardContent}>
          <Text variant="titleMedium">
            {t("financial.feeStatusFor", { month: monthLabel(month) })}
          </Text>
          <View style={styles.statusRow}>
            <Chip mode={isPaid ? "flat" : "outlined"}>
              {isPaid ? t("financial.paid") : t("financial.pending")}
            </Chip>
            {isPaid && current?.amount ? (
              <Text style={styles.amount}>{current.amount}</Text>
            ) : null}
          </View>
        </Card.Content>
      </Card>

      <Text variant="titleMedium" style={styles.heading}>
        {t("parent.feeHistory")}
      </Text>
      {payments.map((payment) => (
        <List.Item
          key={payment.id}
          title={monthLabel(payment.month)}
          description={payment.note}
          right={() => (
            <View style={styles.rowRight}>
              {payment.paid && payment.amount ? (
                <Text style={styles.amount}>{payment.amount}</Text>
              ) : null}
              <Chip mode={payment.paid ? "flat" : "outlined"}>
                {payment.paid ? t("financial.paid") : t("financial.pending")}
              </Chip>
            </View>
          )}
        />
      ))}
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
  cardContent: {
    gap: 8,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  heading: {
    fontWeight: "600",
    marginTop: 4,
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  amount: {
    fontWeight: "600",
  },
});
