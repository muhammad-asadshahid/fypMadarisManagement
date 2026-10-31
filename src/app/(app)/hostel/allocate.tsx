import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  Divider,
  List,
  Snackbar,
  Text,
  useTheme,
} from "react-native-paper";

import { EmptyState } from "@/components/common/empty-state";
import { ScreenWrapper } from "@/components/common/screen-wrapper";
import { hostelService } from "@/modules/hostel/service";
import { studentService } from "@/modules/students/service";
import type { HostelAllocation, Room, Student } from "@/types";

export default function HostelAllocateScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [allocations, setAllocations] = useState<HostelAllocation[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [roomList, studentList, allocationList] = await Promise.all([
        hostelService.getRooms(),
        studentService.getAll(),
        hostelService.getAllocations(),
      ]);
      setRooms(roomList);
      setAllStudents(studentList);
      setAllocations(allocationList);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const occupiedFor = (roomId: string) =>
    allocations.filter((allocation) => allocation.roomId === roomId).length;

  // A student is assignable only when they are a hostelite and not already
  // living in a room — checking the allocations themselves (not just
  // `hostelStatus`) prevents the same student being placed twice.
  const allocatedStudentIds = useMemo(
    () => new Set(allocations.map((allocation) => allocation.studentId)),
    [allocations],
  );

  const availableStudents = useMemo(
    () =>
      allStudents.filter(
        (student) =>
          student.hostelStatus && !allocatedStudentIds.has(student.id),
      ),
    [allStudents, allocatedStudentIds],
  );

  const studentName = (id: string | null) =>
    allStudents.find((s) => s.id === id)?.name ?? "—";

  const selectedRoomObj = rooms.find((r) => r.id === selectedRoom) ?? null;

  const assignRoom = async () => {
    if (!selectedStudent || !selectedRoom) return;
    const room = rooms.find((r) => r.id === selectedRoom);
    if (room && occupiedFor(room.id) >= room.capacity) {
      setSnackbar(t("hostel.roomFull"));
      return;
    }
    setSaving(true);
    try {
      await hostelService.allocateRoom({
        studentId: selectedStudent,
        roomId: selectedRoom,
      });
      // Reflect the change locally: refresh the lists from source.
      await load();
      setSelectedStudent(null);
      setSelectedRoom(null);
    } catch (err) {
      setSnackbar(
        err instanceof Error ? t(err.message) : t("hostel.roomFull"),
      );
    } finally {
      setSaving(false);
    }
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
        <ActivityIndicator style={styles.loader} />
      ) : (
        <>
          <Card mode="elevated" style={styles.card}>
            <Card.Content style={styles.summaryContent}>
              <Text variant="titleMedium">{t("hostel.assignRoom")}</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t("hostel.student")}</Text>
                <Text style={styles.summaryValue}>
                  {selectedStudent ? studentName(selectedStudent) : "—"}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t("hostel.room")}</Text>
                <Text style={styles.summaryValue}>
                  {selectedRoomObj
                    ? `${selectedRoomObj.name} (${occupiedFor(selectedRoomObj.id)}/${selectedRoomObj.capacity})`
                    : "—"}
                </Text>
              </View>
            </Card.Content>
            <Card.Actions>
              <Button
                mode="contained"
                disabled={!selectedStudent || !selectedRoom || saving}
                loading={saving}
                onPress={assignRoom}
              >
                {t("common.save")}
              </Button>
            </Card.Actions>
          </Card>

          <Text variant="titleMedium" style={styles.section}>
            {`${t("hostel.availableStudents")} (${availableStudents.length})`}
          </Text>
          {availableStudents.length === 0 ? (
            <EmptyState message={t("hostel.noAllocations")} />
          ) : (
            <FlatList
              data={availableStudents}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => {
                const selected = selectedStudent === item.id;
                return (
                  <List.Item
                    title={item.name}
                    description={item.fatherName}
                    onPress={() => setSelectedStudent(item.id)}
                    titleStyle={selected ? styles.selected : undefined}
                    right={
                      selected
                        ? () => (
                            <List.Icon
                              icon="check-circle"
                              color={theme.colors.primary}
                            />
                          )
                        : undefined
                    }
                  />
                );
              }}
              ItemSeparatorComponent={() => <View style={styles.divider} />}
            />
          )}

          <Text variant="titleMedium" style={styles.section}>
            {t("hostel.availableRooms")}
          </Text>
          {rooms.length === 0 ? (
            <EmptyState message={t("hostel.noRooms")} />
          ) : (
            <FlatList
              data={rooms}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => {
                const occupied = occupiedFor(item.id);
                const left = Math.max(0, item.capacity - occupied);
                const full = occupied >= item.capacity;
                const selected = selectedRoom === item.id;
                return (
                  <List.Item
                    title={item.name}
                    description={`${t("hostel.occupied")}: ${occupied} / ${item.capacity}`}
                    disabled={full}
                    onPress={() => {
                      if (!full) setSelectedRoom(item.id);
                    }}
                    titleStyle={selected ? styles.selected : undefined}
                    right={() => (
                      <View style={styles.roomRight}>
                        <Chip
                          style={styles.chip}
                          mode={full ? "flat" : "outlined"}
                        >
                          {full
                            ? t("hostel.full")
                            : `${t("hostel.occupancyLeft")}: ${left}`}
                        </Chip>
                        {selected ? (
                          <List.Icon
                            icon="check-circle"
                            color={theme.colors.primary}
                          />
                        ) : null}
                      </View>
                    )}
                  />
                );
              }}
              ItemSeparatorComponent={() => <View style={styles.divider} />}
            />
          )}

          <Divider style={styles.bigDivider} />
          <Text variant="titleMedium" style={styles.section}>
            {t("hostel.occupancy")}
          </Text>
          {allocations.length === 0 ? (
            <EmptyState message={t("hostel.noAllocations")} />
          ) : (
            allocations.map((allocation) => {
              const student = allStudents.find(
                (s) => s.id === allocation.studentId,
              );
              const room = rooms.find((r) => r.id === allocation.roomId);
              return (
                <List.Item
                  key={allocation.id}
                  title={student?.name ?? allocation.studentId}
                  description={room?.name ?? allocation.roomId}
                  left={() => <List.Icon icon="account" />}
                />
              );
            })
          )}
        </>
      )}

      <Snackbar
        visible={!!snackbar}
        onDismiss={() => setSnackbar(null)}
        duration={2500}
      >
        {snackbar ?? ""}
      </Snackbar>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  loader: { marginTop: 48 },
  card: { marginBottom: 12 },
  summaryContent: { gap: 6 },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  summaryLabel: { opacity: 0.7 },
  summaryValue: { fontWeight: "600", flexShrink: 1, textAlign: "right" },
  section: { marginTop: 16, marginBottom: 4, fontWeight: "600" },
  divider: { height: 1, backgroundColor: "#E0E0E0" },
  bigDivider: { marginTop: 20 },
  selected: { fontWeight: "700" },
  roomRight: { flexDirection: "row", alignItems: "center" },
  chip: { alignSelf: "center" },
});
