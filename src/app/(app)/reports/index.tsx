import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { ActivityIndicator, Card, Text } from "react-native-paper";

import { ScreenWrapper } from "@/components/common/screen-wrapper";
import { supabase, SUPABASE_CONFIGURED } from "@/lib/supabase";

export default function ReportsScreen() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [counts, setCounts] = useState({ students: 0, teachers: 0 });

  useEffect(() => {
    if (!SUPABASE_CONFIGURED || !supabase) return;
    const client = supabase;

    const loadCounts = async () => {
      setLoading(true);
      setError(null);
      try {
        const [studentsRes, teachersRes] = await Promise.all([
          client.from("students").select("id", { count: "exact", head: true }),
          client.from("teachers").select("id", { count: "exact", head: true }),
        ]);

        if (studentsRes.error || teachersRes.error) {
          throw new Error(
            studentsRes.error?.message ||
              teachersRes.error?.message ||
              "Unable to load reports",
          );
        }

        setCounts({
          students: studentsRes.count ?? 0,
          teachers: teachersRes.count ?? 0,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    loadCounts();
  }, []);

  return (
    <ScreenWrapper title={t("nav.reports")}>
      <View style={styles.container}>
        {!SUPABASE_CONFIGURED ? (
          <Text>{t("common.error")}: Supabase is not configured.</Text>
        ) : loading ? (
          <ActivityIndicator />
        ) : error ? (
          <Text>
            {t("common.error")}: {error}
          </Text>
        ) : (
          <View style={styles.cards}>
            <Card style={styles.card} mode="elevated">
              <Card.Content>
                <Text variant="titleLarge">{counts.students}</Text>
                <Text>{t("reports.totalStudents")}</Text>
              </Card.Content>
            </Card>
            <Card style={styles.card} mode="elevated">
              <Card.Content>
                <Text variant="titleLarge">{counts.teachers}</Text>
                <Text>{t("reports.totalTeachers")}</Text>
              </Card.Content>
            </Card>
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
