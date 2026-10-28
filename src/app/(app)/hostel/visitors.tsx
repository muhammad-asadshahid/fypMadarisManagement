import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, StyleSheet, View } from "react-native";
import { Button, Card, List, Text, TextInput } from "react-native-paper";

import { ScreenWrapper } from "@/components/common/screen-wrapper";
import { hostelService } from "@/modules/hostel/service";
import { studentService } from "@/modules/students/service";
import type { Student, VisitorRecord } from "@/types";

export default function HostelVisitorsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [visitorName, setVisitorName] = useState("");
  const [visitDate, setVisitDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [notes, setNotes] = useState("");
  const [records, setRecords] = useState<VisitorRecord[]>([]);

  useEffect(() => {
    const load = async () => {
      const [studentList, visitorList] = await Promise.all([
        studentService.getAll(),
        hostelService.getVisitors(),
      ]);
      setStudents(studentList.filter((student) => student.hostelStatus));
      setRecords(visitorList);
    };
    load();
  }, []);

  const submitVisitor = async () => {
    if (!selectedStudent || !visitorName) return;
    const record = await hostelService.recordVisitor({
      studentId: selectedStudent,
      visitorName,
      visitDate,
      notes: notes || undefined,
    });
    setRecords((prev) => [record, ...prev]);
    setVisitorName("");
    setNotes("");
  };

  return (
    <ScreenWrapper title={t("hostel.recordVisitor") || "Record Visitor"}>
      <View style={styles.topRow}>
        <Button onPress={() => router.push("/(app)/hostel" as never)}>
          {t("common.back")}
        </Button>
      </View>
      <Card mode="elevated" style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">{t("hostel.recordVisitor")}</Text>
          <Text>{t("hostel.availableStudents")}</Text>
          <FlatList
            data={students}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <List.Item
                title={item.name}
                description={item.fatherName}
                onPress={() => setSelectedStudent(item.id)}
                titleStyle={
                  selectedStudent === item.id ? styles.selected : undefined
                }
              />
            )}
            ItemSeparatorComponent={() => <View style={styles.divider} />}
          />
          <TextInput
            label={`${t("hostel.visitorName")} (${t("students.name")})`}
            value={visitorName}
            onChangeText={setVisitorName}
            style={styles.input}
          />
          <TextInput
            label={t("hostel.visitDate")}
            value={visitDate}
            onChangeText={setVisitDate}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label={t("hostel.notes")}
            value={notes}
            onChangeText={setNotes}
            mode="outlined"
            multiline
            style={styles.input}
          />
          <Button
            mode="contained"
            onPress={submitVisitor}
            disabled={!selectedStudent || !visitorName}
            style={styles.button}
          >
            {t("common.save")}
          </Button>
        </Card.Content>
      </Card>

      <Text variant="titleMedium">{t("hostel.visitorHistory")}</Text>
      {records.length === 0 ? (
        <Card mode="outlined" style={styles.card}>
          <Card.Content>
            <Text>{t("hostel.noVisitorRecords")}</Text>
          </Card.Content>
        </Card>
      ) : (
        records.map((record) => (
          <Card key={record.id} mode="outlined" style={styles.card}>
            <Card.Content>
              <Text>{`${record.visitDate} • ${record.visitorName} → ${
                students.find((s) => s.id === record.studentId)?.name ??
                record.studentId
              }`}</Text>
              <Text>{record.notes || ""}</Text>
            </Card.Content>
          </Card>
        ))
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: "row", justifyContent: "flex-start" },
  card: { marginBottom: 12 },
  divider: { height: 1, backgroundColor: "#E0E0E0" },
  selected: { fontWeight: "700" },
  input: { marginTop: 12 },
  button: { marginTop: 12 },
});
