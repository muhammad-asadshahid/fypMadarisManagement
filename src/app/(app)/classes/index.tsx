import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Card,
  Chip,
  Divider,
  List,
  Text,
} from "react-native-paper";

import { EmptyState } from "@/components/common/empty-state";
import { ScreenWrapper } from "@/components/common/screen-wrapper";
import { PROGRAM_LABEL_KEYS } from "@/constants/programs";
import { studentService } from "@/modules/students/service";
import type { ClassWithStudents } from "@/types";

export default function ClassesScreen() {
  const { t } = useTranslation();
  const [classes, setClasses] = useState<ClassWithStudents[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      setClasses(await studentService.getClassesWithStudents());
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  if (loading) {
    return (
      <ScreenWrapper title={t("classes.title")}>
        <ActivityIndicator style={styles.loader} />
      </ScreenWrapper>
    );
  }

  if (classes.length === 0) {
    return (
      <ScreenWrapper title={t("classes.title")}>
        <EmptyState message={t("common.noData")} />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper title={t("classes.title")}>
      {classes.map((cls) => (
        <Card key={cls.id} mode="elevated" style={styles.card}>
          <Card.Content>
            <View style={styles.headerRow}>
              <View style={styles.headerInfo}>
                <Text variant="titleMedium">{cls.name}</Text>
                <Text variant="bodySmall" style={styles.programType}>
                  {t("classes.programType")}:{" "}
                  {t(PROGRAM_LABEL_KEYS[cls.programType])}
                </Text>
              </View>
              <Chip icon="account-multiple" compact mode="flat">
                {cls.students.length}
              </Chip>
            </View>

            {cls.students.length === 0 ? (
              <Text variant="bodySmall" style={styles.empty}>
                {t("classes.noStudents")}
              </Text>
            ) : (
              cls.students.map((student, index) => (
                <View key={student.id}>
                  {index > 0 && <Divider />}
                  <List.Item
                    title={student.name}
                    description={`${t("students.fatherName")}: ${student.fatherName} • ${student.contactNumber}`}
                    right={() => <List.Icon icon="chevron-right" />}
                    onPress={() =>
                      router.push(`/(app)/students/${student.id}` as never)
                    }
                  />
                </View>
              ))
            )}
          </Card.Content>
        </Card>
      ))}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  loader: {
    marginTop: 48,
  },
  card: {
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 8,
  },
  headerInfo: {
    flex: 1,
    gap: 2,
  },
  programType: {
    opacity: 0.7,
  },
  empty: {
    marginTop: 8,
    opacity: 0.7,
  },
});
