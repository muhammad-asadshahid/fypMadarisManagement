import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { ActivityIndicator, Card, Text } from "react-native-paper";

import { EmptyState } from "@/components/common/empty-state";
import {
  EMPTY_MEAL_PLAN,
  MEAL_PLAN_DAYS,
  MEAL_SLOTS,
} from "@/constants/hostel";
import { hostelService } from "@/modules/hostel/service";
import type { MealPlanDay } from "@/types";

export function MealPlanSection() {
  const { t } = useTranslation();
  const [plan, setPlan] = useState<MealPlanDay[]>(EMPTY_MEAL_PLAN);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const stored = await hostelService.getMealPlan();
      setPlan(
        MEAL_PLAN_DAYS.map(
          (id) =>
            stored.find((day) => day.id === id) ?? {
              id,
              breakfast: "",
              lunch: "",
              dinner: "",
            },
        ),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (loading) {
    return <ActivityIndicator style={styles.loader} />;
  }

  const hasContent = plan.some(
    (day) => day.breakfast || day.lunch || day.dinner,
  );

  if (!hasContent) {
    return <EmptyState message={t("parent.noMeals")} />;
  }

  return (
    <View style={styles.container}>
      {plan.map((day) => (
        <Card key={day.id} mode="elevated">
          <Card.Content style={styles.cardContent}>
            <Text variant="titleMedium" style={styles.day}>
              {t(`hostel.day_${day.id}`)}
            </Text>
            {MEAL_SLOTS.map((slot) => (
              <View key={slot} style={styles.row}>
                <Text variant="labelLarge" style={styles.slotLabel}>
                  {t(`hostel.meal_${slot}`)}
                </Text>
                <Text variant="bodyMedium" style={styles.slotValue}>
                  {day[slot] || "—"}
                </Text>
              </View>
            ))}
          </Card.Content>
        </Card>
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
    gap: 6,
  },
  day: {
    fontWeight: "700",
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  slotLabel: {
    opacity: 0.7,
  },
  slotValue: {
    flex: 1,
    textAlign: "right",
    fontWeight: "500",
  },
});
