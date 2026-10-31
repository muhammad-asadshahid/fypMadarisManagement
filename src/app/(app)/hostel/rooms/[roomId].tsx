import {
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  Dialog,
  Divider,
  IconButton,
  List,
  Portal,
  Snackbar,
  Text,
  TextInput,
} from "react-native-paper";

import { EmptyState } from "@/components/common/empty-state";
import { ScreenWrapper } from "@/components/common/screen-wrapper";
import { hostelService } from "@/modules/hostel/service";
import { studentService } from "@/modules/students/service";
import type { HostelAllocation, Room, Student } from "@/types";

export default function HostelRoomDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const navigation = useNavigation();
  const { roomId } = useLocalSearchParams<{ roomId: string }>();

  const [room, setRoom] = useState<Room | null>(null);
  const [allocations, setAllocations] = useState<HostelAllocation[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [pendingRemove, setPendingRemove] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!roomId) return;
    setLoading(true);
    try {
      const [found, allocationList, studentList] = await Promise.all([
        hostelService.getRoom(roomId),
        hostelService.getAllocations(),
        studentService.getAll(),
      ]);
      setRoom(found);
      setName(found?.name ?? "");
      setCapacity(found ? String(found.capacity) : "");
      setAllocations(
        allocationList.filter((allocation) => allocation.roomId === roomId),
      );
      setStudents(studentList);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  useEffect(() => {
    if (room) navigation.setOptions({ title: room.name });
  }, [navigation, room]);

  const occupants = useMemo(
    () =>
      allocations.map((allocation) => ({
        allocation,
        student: students.find((s) => s.id === allocation.studentId),
      })),
    [allocations, students],
  );

  const capNum = Number(capacity.replace(/[^0-9]/g, "")) || 0;
  const canSave = !!name.trim() && capNum >= 1;

  const saveRoom = async () => {
    if (!room || !canSave) return;
    if (capNum < occupants.length) {
      setSnackbar(
        t("hostel.capacityBelowOccupancy", { count: occupants.length }),
      );
      return;
    }
    setSaving(true);
    try {
      const updated = await hostelService.updateRoom(room.id, {
        name: name.trim(),
        capacity: capNum,
      });
      setRoom(updated);
      setSnackbar(t("hostel.updated"));
    } catch {
      setSnackbar(t("common.error"));
    } finally {
      setSaving(false);
    }
  };

  const removeOccupant = async () => {
    if (!pendingRemove) return;
    setRemoving(true);
    try {
      await hostelService.removeAllocation(pendingRemove.id);
      setPendingRemove(null);
      await load();
      setSnackbar(t("hostel.removed"));
    } catch {
      setSnackbar(t("common.error"));
    } finally {
      setRemoving(false);
    }
  };

  if (loading) {
    return (
      <ScreenWrapper title={t("hostel.editRoom")}>
        <ActivityIndicator style={styles.loader} />
      </ScreenWrapper>
    );
  }

  if (!room) {
    return (
      <ScreenWrapper title={t("hostel.editRoom")}>
        <EmptyState message={t("hostel.noRooms")} />
      </ScreenWrapper>
    );
  }

  const occupied = occupants.length;
  const left = Math.max(0, room.capacity - occupied);

  return (
    <ScreenWrapper
      title={t("hostel.editRoom")}
      action={
        <Button onPress={() => router.push("/(app)/hostel/rooms" as never)}>
          {t("common.back")}
        </Button>
      }
    >
      <Card mode="elevated" style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <TextInput
            label={t("hostel.roomName")}
            value={name}
            onChangeText={setName}
            mode="outlined"
          />
          <TextInput
            label={t("hostel.capacity")}
            value={capacity}
            onChangeText={(value) => setCapacity(value.replace(/[^0-9]/g, ""))}
            mode="outlined"
            keyboardType="numeric"
          />
          <Text variant="bodyMedium" style={styles.occupancyLine}>
            {`${t("hostel.occupied")}: ${occupied} / ${room.capacity}   •   ${t("hostel.occupancyLeft")}: ${left}`}
          </Text>
          <Button
            mode="contained"
            onPress={saveRoom}
            loading={saving}
            disabled={!canSave || saving}
          >
            {t("common.save")}
          </Button>
        </Card.Content>
      </Card>

      <Text variant="titleMedium" style={styles.section}>
        {`${t("hostel.occupants")} (${occupied})`}
      </Text>
      {occupants.length === 0 ? (
        <EmptyState message={t("hostel.noOccupants")} />
      ) : (
        occupants.map(({ allocation, student }, index) => (
          <View key={allocation.id}>
            {index > 0 ? <Divider /> : null}
            <List.Item
              title={student?.name ?? allocation.studentId}
              description={student?.fatherName}
              left={() => <List.Icon icon="account" />}
              right={() => (
                <IconButton
                  icon="account-remove"
                  onPress={() =>
                    setPendingRemove({
                      id: allocation.id,
                      name: student?.name ?? allocation.studentId,
                    })
                  }
                  accessibilityLabel={t("hostel.remove")}
                />
              )}
            />
          </View>
        ))
      )}

      <Portal>
        <Dialog
          visible={!!pendingRemove}
          onDismiss={() => setPendingRemove(null)}
        >
          <Dialog.Title>{t("hostel.remove")}</Dialog.Title>
          <Dialog.Content>
            <Text>
              {`${pendingRemove?.name ?? ""} — ${t("hostel.removeConfirm")}`}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setPendingRemove(null)}>
              {t("common.cancel")}
            </Button>
            <Button
              onPress={removeOccupant}
              loading={removing}
              textColor="#B00020"
            >
              {t("hostel.remove")}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

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
  cardContent: { gap: 12 },
  occupancyLine: { fontStyle: "italic" },
  section: { marginTop: 8, marginBottom: 4, fontWeight: "600" },
});
