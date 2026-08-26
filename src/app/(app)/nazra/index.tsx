import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, StyleSheet, View } from "react-native";
import { ActivityIndicator, Chip, List } from "react-native-paper";

import { EmptyState } from "@/components/common/empty-state";
import { ScreenWrapper } from "@/components/common/screen-wrapper";
import { PROGRAM_LABEL_KEYS } from "@/constants/programs";
import { nazraService } from "@/modules/nazra/service";
import { studentService } from "@/modules/students/service";
import type { NazraRecord, Student } from "@/types";

export default function NazraScreen() {
  const { t } = useTranslation();
  const [students, setStudents] = useState<Student[]>([]);
  const [latestByStudent, setLatestByStudent] = useState<
    Record<string, NazraRecord>
  >({});
  const [loading, setLoading] = useState(true);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const studentList = await studentService.getAll();
      setStudents(studentList);

      const nazraStudents = studentList.filter(
        (s) => s.programType === "nazra_quran",
      );
      const latest: Record<string, NazraRecord> = {};
      await Promise.all(
        nazraStudents.map(async (s) => {
          const recs = await nazraService.getByStudent(s.id);
          if (recs.length) latest[s.id] = recs[0];
        }),
      );
      setLatestByStudent(latest);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStudents();
    }, [loadStudents]),
  );

  const nazraStudents = useMemo(
    () => students.filter((s) => s.programType === "nazra_quran"),
    [students],
  );

  return (
    <ScreenWrapper title={t("nav.nazra")}>
      {loading ? (
        <ActivityIndicator style={styles.loader} />
      ) : nazraStudents.length === 0 ? (
        <EmptyState message={t("common.noData")} />
      ) : (
        <FlatList
          data={nazraStudents}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const rec = latestByStudent[item.id];
            return (
              <List.Item
                title={item.name}
                description={`${t(PROGRAM_LABEL_KEYS[item.programType])} • Pages ${rec ? `${rec.pageFrom}\u2013${rec.pageTo}` : "\u2014"}`}
                right={() => (
                  <Chip style={styles.chip} mode="outlined">
                    {rec ? `${Math.round(rec.completionPercentage)}%` : "\u2014"}
                  </Chip>
                )}
              />
            );
          }}
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
