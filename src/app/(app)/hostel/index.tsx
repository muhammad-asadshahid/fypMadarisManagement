import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  List,
  Text,
} from "react-native-paper";

import { EmptyState } from "@/components/common/empty-state";
import { ScreenWrapper } from "@/components/common/screen-wrapper";
import { PROGRAM_LABEL_KEYS } from "@/constants/programs";
import { hostelService } from "@/modules/hostel/service";
import { studentService } from "@/modules/students/service";
import type { Class, HostelAllocation, Room, Student } from "@/types";

export default function HostelScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [allocations, setAllocations] = useState<HostelAllocation[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [studentList, classList, roomList, allocationList] =
        await Promise.all([
          studentService.getAll(),
          studentService.getClasses(),
          hostelService.getRooms(),
          hostelService.getAllocations(),
        ]);
      setStudents(studentList);
      setClasses(classList);
      setRooms(roomList);
      setAllocations(allocationList);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const hostelStudents = useMemo(
    () => students.filter((student) => student.hostelStatus),
    [students],
  );

  const occupiedFor = (roomId: string) =>
    allocations.filter((allocation) => allocation.roomId === roomId).length;

  const totalCapacity = rooms.reduce((sum, room) => sum + room.capacity, 0);
  const totalOccupied = allocations.length;
  const totalLeft = Math.max(0, totalCapacity - totalOccupied);

  return (
    <ScreenWrapper
      title={t("nav.hostel")}
      action={
        <View style={styles.buttonsRow}>
          <Button
            mode="contained"
            compact
            onPress={() => router.push("/(app)/hostel/rooms" as never)}
          >
            {t("hostel.rooms")}
          </Button>
          <Button
            mode="outlined"
            compact
            onPress={() => router.push("/(app)/hostel/allocate" as never)}
          >
            {t("hostel.allocate")}
          </Button>
        </View>
      }
    >
      {loading ? (
        <ActivityIndicator style={styles.loader} />
      ) : (
        <>
          <Card mode="elevated" style={styles.summaryCard}>
            <Card.Content>
              <Text variant="headlineMedium">
                {`${totalOccupied} / ${totalCapacity}`}
              </Text>
              <Text>{t("hostel.occupancy")}</Text>
              <Text variant="bodyMedium" style={styles.summarySub}>
                {`${t("hostel.occupancyLeft")}: ${totalLeft}`}
              </Text>
            </Card.Content>
          </Card>

          <View style={styles.actionRow}>
            <Button
              mode="contained"
              onPress={() => router.push("/(app)/hostel/meals" as never)}
            >
              {t("hostel.mealPlan")}
            </Button>
            <Button
              mode="contained"
              onPress={() => router.push("/(app)/hostel/visitors" as never)}
            >
              {t("hostel.recordVisitor")}
            </Button>
          </View>

          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t("hostel.rooms")}
          </Text>
          {rooms.length === 0 ? (
            <EmptyState message={t("hostel.noRooms")} />
          ) : (
            rooms.map((room) => {
              const occupied = occupiedFor(room.id);
              const left = Math.max(0, room.capacity - occupied);
              const full = occupied >= room.capacity;
              return (
                <List.Item
                  key={room.id}
                  title={room.name}
                  description={`${t("hostel.occupied")}: ${occupied} / ${room.capacity}`}
                  onPress={() =>
                    router.push(`/(app)/hostel/rooms/${room.id}` as never)
                  }
                  right={() => (
                    <Chip style={styles.chip} mode={full ? "flat" : "outlined"}>
                      {full
                        ? t("hostel.full")
                        : `${t("hostel.occupancyLeft")}: ${left}`}
                    </Chip>
                  )}
                />
              );
            })
          )}

          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t("hostel.hostel")}
          </Text>
          {hostelStudents.length === 0 ? (
            <EmptyState message={t("hostel.noAllocations")} />
          ) : (
            <FlatList
              data={hostelStudents}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => {
                const className =
                  classes.find((cls) => cls.id === item.classId)?.name ??
                  t("hostel.unknownClass");
                return (
                  <List.Item
                    title={item.name}
                    description={`${t(PROGRAM_LABEL_KEYS[item.programType])} • ${className}`}
                    right={() => (
                      <Chip style={styles.chip} mode="outlined">
                        {t("hostel.hostel")}
                      </Chip>
                    )}
                  />
                );
              }}
              ItemSeparatorComponent={() => <View style={styles.divider} />}
            />
          )}
        </>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  loader: {
    marginTop: 48,
  },
  buttonsRow: {
    flexDirection: "row",
    gap: 8,
  },
  summaryCard: {
    marginBottom: 16,
  },
  summarySub: {
    marginTop: 4,
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
    marginTop: 16,
  },
  sectionTitle: {
    marginTop: 24,
    marginBottom: 4,
    fontWeight: "600",
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
