import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, FlatList, StyleSheet, Text, View } from "react-native";
import { StudentService } from "../lib/mock-services";

export default function StudentsScreen() {
  const { t } = useTranslation();
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const s = await StudentService.list();
      setStudents(s as any[]);
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("students.title")}</Text>
      <FlatList
        data={students}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>
              {item.name} — {item.program}
            </Text>
          </View>
        )}
        ListEmptyComponent={() => <Text>{t("common.noData")}</Text>}
      />
      <View style={{ marginTop: 12 }}>
        <Button title={t("students.addStudent")} onPress={() => {}} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: "600", marginBottom: 8 },
  item: { padding: 8, borderBottomWidth: 1, borderColor: "#eee" },
});
