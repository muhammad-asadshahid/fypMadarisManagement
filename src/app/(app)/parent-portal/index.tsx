import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, StyleSheet, View } from "react-native";
import { ActivityIndicator, List } from "react-native-paper";

import { EmptyState } from "@/components/common/empty-state";
import { ScreenWrapper } from "@/components/common/screen-wrapper";
import { studentService } from "@/modules/students/service";
import { useAuthStore } from "@/store/authStore";
import type { Student } from "@/types";

export default function ParentPortalScreen() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
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

  const children = useMemo(() => {
    if (!user?.parentStudentIds) return [];
    return students.filter((student) =>
      user.parentStudentIds?.includes(student.id),
    );
  }, [students, user?.parentStudentIds]);

  if (!user || user.role !== "parent") {
    return (
      <ScreenWrapper title={t("nav.parentPortal")}>
        <EmptyState message="This section is only available for parents." />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper title={t("nav.parentPortal")}>
      {loading ? (
        <ActivityIndicator style={styles.loader} />
      ) : children.length === 0 ? (
        <EmptyState message="No linked student records found for your account." />
      ) : (
        <FlatList
          data={children}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <List.Item
              title={item.name}
              description={`Father: ${item.fatherName} • Contact: ${item.contactNumber}`}
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
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
  },
});
