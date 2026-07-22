import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  List,
  Text,
} from "react-native-paper";

import { ScreenWrapper } from "@/components/common/screen-wrapper";
import { hostelService } from "@/modules/hostel/service";
import { studentService } from "@/modules/students/service";
import type { HostelAllocation, Room, Student } from "@/types";

export default function HostelAllocateScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [allocations, setAllocations] = useState<HostelAllocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [roomList, studentList, allocationList] = await Promise.all([
        hostelService.getRooms(),
        studentService.getAll(),
        hostelService.getAllocations(),
      ]);
      setRooms(roomList);
      setAllStudents(studentList);
      setStudents(studentList.filter((s) => !s.hostelStatus));
      setAllocations(allocationList);
      setLoading(false);
    };
    load();
  }, []);

  const assignRoom = async () => {
    if (!selectedStudent || !selectedRoom) return;
    const allocation = await hostelService.allocateRoom({
      studentId: selectedStudent,
      roomId: selectedRoom,
    });
    setAllocations((prev) => [allocation, ...prev]);
    // mark student as allocated in local state
    setAllStudents((prev) =>
      prev.map((s) =>
        s.id === selectedStudent ? { ...s, hostelStatus: true } : s,
      ),
    );
    setStudents((prev) =>
      prev.filter((student) => student.id !== selectedStudent),
    );
    setSelectedStudent(null);
    setSelectedRoom(null);
  };

  return (
    <ScreenWrapper
      title={t("hostel.allocate")}
      action={
        <Button onPress={() => router.push("/(app)/hostel" as never)}>
          {t("common.back")}
        </Button>
      }
    >
      {loading ? (
        <ActivityIndicator style={{ marginTop: 48 }} />
      ) : (
        <>
          <Card mode="elevated" style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium">{t("hostel.assignRoom")}</Text>
              <Text>{t("hostel.assignRoomHelp")}</Text>
            </Card.Content>
            <Card.Actions>
              <Button
                disabled={!selectedStudent || !selectedRoom}
                onPress={assignRoom}
              >
                {t("common.save")}
              </Button>
            </Card.Actions>
          </Card>

          <Text variant="titleMedium" style={styles.section}>
            {t("hostel.availableStudents")}
          </Text>
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

          <Text variant="titleMedium" style={styles.section}>
            {t("hostel.availableRooms")}
          </Text>
          <FlatList
            data={rooms}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <List.Item
                title={item.name}
                description={`${t("hostel.capacity")}: ${item.capacity}`}
                onPress={() => setSelectedRoom(item.id)}
                titleStyle={
                  selectedRoom === item.id ? styles.selected : undefined
                }
              />
            )}
            ItemSeparatorComponent={() => <View style={styles.divider} />}
          />

          <Text variant="titleMedium" style={styles.section}>
            {t("hostel.occupancy")}
          </Text>
          {allocations.map((allocation) => {
            const student = allStudents.find(
              (s) => s.id === allocation.studentId,
            );
            const room = rooms.find((r) => r.id === allocation.roomId);
            return (
              <Card key={allocation.id} mode="outlined" style={styles.card}>
                <Card.Content>
                  <Text>{`${student?.name ?? allocation.studentId} → ${room?.name ?? allocation.roomId}`}</Text>
                  <Text>{allocation.assignedAt}</Text>
                </Card.Content>
              </Card>
            );
          })}
        </>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12 },
  section: { marginTop: 16, marginBottom: 8 },
  divider: { height: 1, backgroundColor: "#E0E0E0" },
  selected: { fontWeight: "700" },
});
