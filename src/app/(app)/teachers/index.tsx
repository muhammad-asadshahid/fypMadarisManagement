import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, StyleSheet, View } from "react-native";
import { ActivityIndicator, FAB, Searchbar } from "react-native-paper";

import { EmptyState } from "@/components/common/empty-state";
import { ScreenWrapper } from "@/components/common/screen-wrapper";
import { TeacherCard } from "@/components/teachers/teacher-card";
import { teacherService } from "@/modules/teachers/service";
import type { Teacher } from "@/types";

export default function TeachersListScreen() {
  const { t } = useTranslation();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = search
        ? await teacherService.search(search)
        : await teacherService.getAll();
      setTeachers(list);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  useEffect(() => {
    const timeout = setTimeout(load, 300);
    return () => clearTimeout(timeout);
  }, [search, load]);

  return (
    <ScreenWrapper title={t("nav.teachers")} scrollable={false}>
      <View style={styles.container}>
        <Searchbar
          placeholder={t("teachers.searchPlaceholder")}
          value={search}
          onChangeText={setSearch}
          style={styles.search}
        />

        {loading ? (
          <ActivityIndicator style={styles.loader} />
        ) : teachers.length === 0 ? (
          <EmptyState message={t("common.noData")} />
        ) : (
          <FlatList
            data={teachers}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <TeacherCard teacher={item} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}
          />
        )}

        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => router.push("/(app)/teachers/add" as never)}
          label={t("teachers.addTeacher")}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  search: { marginBottom: 8 },
  loader: { marginTop: 48 },
  list: { paddingBottom: 88 },
  fab: { position: "absolute", right: 16, bottom: 16 },
});
