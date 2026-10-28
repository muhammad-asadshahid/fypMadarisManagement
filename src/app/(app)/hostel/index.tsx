import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  List,
  Text,
} from "react-native-paper";

import { EmptyState } from "@/components/common/empty-state";
import { ScreenWrapper } from "@/components/common/screen-wrapper";
import { PROGRAM_LABEL_KEYS } from "@/constants/programs";
import { studentService } from "@/modules/students/service";
import type { Class, Student } from "@/types";

export default function HostelScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [studentList, classList] = await Promise.all([
        studentService.getAll(),
        studentService.getClasses(),
      ]);
      setStudents(studentList);
      setClasses(classList);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const hostelStudents = useMemo(
    () => students.filter((student) => student.hostelStatus),
    [students],
  );

  const totalHostel = hostelStudents.length;

  return (
    <ScreenWrapper
      title={t("nav.hostel")}
      action={
        <View style={styles.buttonsRow}>
          <Button
            mode="contained"
            compact
            onPress={() => router.push("/(app)/hostel/rooms" as never)}
          >
            {t("hostel.rooms")}
          </Button>
          <Button
            mode="outlined"
            compact
            onPress={() => router.push("/(app)/hostel/allocate" as never)}
          >
            {t("hostel.allocate")}
          </Button>
        </View>
      }
    >
      {loading ? (
        <ActivityIndicator style={styles.loader} />
      ) : (
        <>
          <Card mode="elevated" style={styles.summaryCard}>
            <Card.Content>
              <Text variant="headlineMedium">{totalHostel}</Text>
              <Text>{t("hostel.occupancy")}</Text>
            </Card.Content>
          </Card>

          <View style={styles.actionRow}>
            <Button
              mode="contained"
              onPress={() => router.push("/(app)/hostel/meals" as never)}
            >
              {t("hostel.mealPlan")}
            </Button>
            <Button
              mode="contained"
              onPress={() => router.push("/(app)/hostel/visitors" as never)}
            >
              {t("hostel.recordVisitor")}
            </Button>
          </View>

          {hostelStudents.length === 0 ? (
            <EmptyState message={t("hostel.noAllocations")} />
          ) : (
            <FlatList
              data={hostelStudents}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const className =
                  classes.find((cls) => cls.id === item.classId)?.name ??
                  t("hostel.unknownClass");
                return (
                  <List.Item
                    title={item.name}
                    description={`${t(PROGRAM_LABEL_KEYS[item.programType])} • ${className}`}
                    right={() => (
                      <Chip style={styles.chip} mode="outlined">
                        {t("hostel.hostel")}
                      </Chip>
                    )}
                  />
                );
              }}
              ItemSeparatorComponent={() => <View style={styles.divider} />}
            />
          )}
        </>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  loader: {
    marginTop: 48,
  },
  buttonsRow: {
    flexDirection: "row",
    gap: 8,
  },
  summaryCard: {
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
    marginTop: 16,
  },
  chip: {
    alignSelf: "center",
    marginRight: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
  },
});
