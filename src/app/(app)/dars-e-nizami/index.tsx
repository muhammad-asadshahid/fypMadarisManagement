import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, StyleSheet, View } from "react-native";
import { ActivityIndicator, Chip, List } from "react-native-paper";

import { EmptyState } from "@/components/common/empty-state";
import { ScreenWrapper } from "@/components/common/screen-wrapper";
import { PROGRAM_LABEL_KEYS } from "@/constants/programs";
import { studentService } from "@/modules/students/service";
import type { Student } from "@/types";

export default function DarsENizamiScreen() {
  const { t } = useTranslation();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const studentList = await studentService.getAll();
      setStudents(studentList);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStudents();
    }, [loadStudents]),
  );

  const darsStudents = useMemo(
    () => students.filter((student) => student.programType === "dars_e_nizami"),
    [students],
  );

  return (
    <ScreenWrapper title={t("nav.darsENizami")}>
      {loading ? (
        <ActivityIndicator style={styles.loader} />
      ) : darsStudents.length === 0 ? (
        <EmptyState message={t("common.noData")} />
      ) : (
        <FlatList
          data={darsStudents}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <List.Item
              title={item.name}
              description={`${t(PROGRAM_LABEL_KEYS[item.programType])} • ${item.admissionDate}`}
              right={() => (
                <Chip style={styles.chip} mode="outlined">
                  {item.classId}
                </Chip>
              )}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.divider} />}
        />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  loader: {
    marginTop: 48,
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
