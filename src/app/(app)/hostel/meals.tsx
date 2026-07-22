import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { Button, Card, Text, TextInput } from "react-native-paper";

import { ScreenWrapper } from "@/components/common/screen-wrapper";
import { studentService } from "@/modules/students/service";
import type { Student } from "@/types";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const TIMES = ["Breakfast", "Lunch", "Dinner"];

export default function HostelMealsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [students, setStudents] = useState<Student[]>([]);
  const [rooms, setRooms] = useState<string[]>([]);
  const [weekPlan, setWeekPlan] = useState<
    Record<string, Record<string, string>>
  >({});

  useEffect(() => {
    const load = async () => {
      const studentList = await studentService.getAll();
      setStudents(studentList.filter((s) => s.hostelStatus));

      // initialize empty week plan
      const initial: Record<string, Record<string, string>> = {};
      for (const day of DAYS) {
        initial[day] = {};
        for (const time of TIMES) {
          initial[day][time] = "";
        }
      }
      setWeekPlan(initial);
    };
    load();
  }, []);

  const updateCell = (day: string, time: string, value: string) => {
    setWeekPlan((prev) => ({
      ...prev,
      [day]: {
        ...(prev[day] ?? {}),
        [time]: value,
      },
    }));
  };

  const exportPlan = () => {
    // For now just console log; could save via hostelService later
    console.log("Week Plan:", weekPlan);
  };

  return (
    <ScreenWrapper title={t("hostel.recordMeal") || "Meal Planner"}>
      <View style={styles.topRow}>
        <Button onPress={() => router.push("/(app)/hostel" as never)}>
          {t("common.back")}
        </Button>
      </View>

      <Card mode="elevated" style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">Weekly Meal Planner</Text>
          {/* weekly planner - no per-student or per-room selection */}

          {DAYS.map((day) => (
            <View key={day} style={styles.daySection}>
              <Text variant="titleSmall" style={styles.dayTitle}>
                {day}
              </Text>
              {TIMES.map((time) => (
                <TextInput
                  key={time}
                  label={`${time}`}
                  value={weekPlan[day]?.[time] ?? ""}
                  onChangeText={(v) => updateCell(day, time, v)}
                  style={styles.input}
                />
              ))}
            </View>
          ))}

          <Button mode="contained" onPress={exportPlan} style={styles.button}>
            {t("common.save")}
          </Button>
        </Card.Content>
      </Card>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: "row", justifyContent: "flex-start" },
  card: { marginBottom: 12 },
  daySection: { marginTop: 12 },
  dayTitle: { fontWeight: "700", marginBottom: 8 },
  input: { marginBottom: 8 },
  button: { marginTop: 12 },
});
