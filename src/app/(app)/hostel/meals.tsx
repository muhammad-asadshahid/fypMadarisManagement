import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { Button, Card, Text, TextInput } from "react-native-paper";

import { ScreenWrapper } from "@/components/common/screen-wrapper";
import { EMPTY_MEAL_PLAN, MEAL_PLAN_DAYS, MEAL_SLOTS } from "@/constants/hostel";
import { hostelService } from "@/modules/hostel/service";
import type { MealPlanDay } from "@/types";

type MealSlot = (typeof MEAL_SLOTS)[number];

export default function HostelMealsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [plan, setPlan] = useState<MealPlanDay[]>(EMPTY_MEAL_PLAN);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
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
    };
    load();
  }, []);

  const updateSlot = (dayId: string, slot: MealSlot, value: string) => {
    setSaved(false);
    setPlan((prev) =>
      prev.map((day) => (day.id === dayId ? { ...day, [slot]: value } : day)),
    );
  };

  const save = async () => {
    setIsSaving(true);
    try {
      await hostelService.saveMealPlan(plan);
      setSaved(true);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScreenWrapper title={t("hostel.mealPlan")}>
      <View style={styles.topRow}>
        <Button onPress={() => router.push("/(app)/hostel" as never)}>
          {t("common.back")}
        </Button>
      </View>

      {plan.map((day) => (
        <Card key={day.id} mode="elevated" style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.dayTitle}>
              {t(`hostel.day_${day.id}`)}
            </Text>
            {MEAL_SLOTS.map((slot) => (
              <TextInput
                key={slot}
                label={t(`hostel.meal_${slot}`)}
                value={day[slot]}
                onChangeText={(value) => updateSlot(day.id, slot, value)}
                mode="outlined"
                style={styles.input}
              />
            ))}
          </Card.Content>
        </Card>
      ))}

      <Button
        mode="contained"
        onPress={save}
        loading={isSaving}
        style={styles.button}
      >
        {saved ? t("hostel.mealPlanSaved") : t("common.save")}
      </Button>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: "row", justifyContent: "flex-start" },
  card: { marginBottom: 12 },
  dayTitle: { marginBottom: 8, fontWeight: "700" },
  input: { marginBottom: 8 },
  button: { marginTop: 12 },
});
