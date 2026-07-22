import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, StyleSheet, View } from "react-native";
import { ActivityIndicator, Chip, List } from "react-native-paper";

import { EmptyState } from "@/components/common/empty-state";
import { ScreenWrapper } from "@/components/common/screen-wrapper";
import { PROGRAM_LABEL_KEYS } from "@/constants/programs";
import { studentService } from "@/modules/students/service";
import type { HifzGrade, Student } from "@/types";

const GRADE_ORDER: HifzGrade[] = [
  "mumtaz",
  "jayyid_jiddan",
  "jayyid",
  "needs_improvement",
];

export default function HifzScreen() {
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

  const hifzStudents = useMemo(
    () =>
      students
        .filter((student) => student.programType === "hifz_ul_quran")
        .map((student, index) => ({
          ...student,
          grade: GRADE_ORDER[index % GRADE_ORDER.length],
        })),
    [students],
  );

  return (
    <ScreenWrapper title={t("nav.hifz")}>
      {loading ? (
        <ActivityIndicator style={styles.loader} />
      ) : hifzStudents.length === 0 ? (
        <EmptyState message={t("common.noData")} />
      ) : (
        <FlatList
          data={hifzStudents}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <List.Item
              title={item.name}
              description={`${t(PROGRAM_LABEL_KEYS[item.programType])} • ${item.fatherName}`}
              right={() => (
                <Chip style={styles.chip} mode="outlined">
                  {item.grade}
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
