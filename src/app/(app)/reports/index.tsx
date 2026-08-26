import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { ActivityIndicator, Card, Text } from "react-native-paper";

import { ScreenWrapper } from "@/components/common/screen-wrapper";
import { reportsService } from "@/modules/reports/service";
import type { ReportSummary } from "@/types";

const EMPTY: ReportSummary = {
  totalStudents: 0,
  totalTeachers: 0,
  totalClasses: 0,
  presentToday: 0,
  absentToday: 0,
  totalActiveHostelStudents: 0,
  totalDonations: 0,
  totalFeesCollected: 0,
  totalSalariesPaid: 0,
};

export default function ReportsScreen() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<ReportSummary>(EMPTY);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        setSummary(await reportsService.getSummary());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const cards = [
    { label: t("reports.totalStudents"), value: summary.totalStudents },
    { label: t("reports.totalTeachers"), value: summary.totalTeachers },
    { label: t("reports.totalClasses"), value: summary.totalClasses },
    { label: t("reports.presentToday"), value: summary.presentToday },
    { label: t("reports.absentToday"), value: summary.absentToday },
    { label: t("reports.hostelStudents"), value: summary.totalActiveHostelStudents },
    {
      label: t("reports.totalDonations"),
      value: summary.totalDonations.toLocaleString(),
    },
    {
      label: t("reports.totalFees"),
      value: summary.totalFeesCollected.toLocaleString(),
    },
    {
      label: t("reports.totalSalaries"),
      value: summary.totalSalariesPaid.toLocaleString(),
    },
  ];

  return (
    <ScreenWrapper title={t("nav.reports")}>
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator />
        ) : error ? (
          <Text>
            {t("common.error")}: {error}
          </Text>
        ) : (
          <View style={styles.cards}>
            {cards.map((c, i) => (
              <Card key={i} style={styles.card} mode="elevated">
                <Card.Content>
                  <Text variant="titleLarge">{c.value}</Text>
                  <Text>{c.label}</Text>
                </Card.Content>
              </Card>
            ))}
          </View>
        )}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  cards: {
    gap: 16,
  },
  card: {
    marginBottom: 16,
  },
});
