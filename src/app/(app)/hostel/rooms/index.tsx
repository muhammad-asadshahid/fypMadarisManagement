import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, View } from "react-native";
import { Button, Card, Chip, Text, TextInput } from "react-native-paper";

import { ScreenWrapper } from "@/components/common/screen-wrapper";
import { hostelService } from "@/modules/hostel/service";
import type { HostelAllocation, Room } from "@/types";

export default function HostelRoomsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [allocations, setAllocations] = useState<HostelAllocation[]>([]);
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = useCallback(async () => {
    const [roomList, allocationList] = await Promise.all([
      hostelService.getRooms(),
      hostelService.getAllocations(),
    ]);
    setRooms(roomList);
    setAllocations(allocationList);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const occupancyFor = (roomId: string) =>
    allocations.filter((allocation) => allocation.roomId === roomId).length;

  const submitRoom = async () => {
    if (!name || !capacity) return;
    setIsSubmitting(true);
    try {
      await hostelService.createRoom({
        name,
        capacity: Number(capacity),
      });
      setName("");
      setCapacity("");
      await load();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenWrapper
      title={t("hostel.rooms")}
      action={
        <Button onPress={() => router.push("/(app)/hostel" as never)}>
          {t("common.back")}
        </Button>
      }
    >
      <Card mode="elevated" style={styles.card}>
        <Card.Content>
          <TextInput
            label={t("hostel.roomName")}
            value={name}
            onChangeText={setName}
            mode="outlined"
          />
          <TextInput
            label={t("hostel.capacity")}
            value={capacity}
            onChangeText={setCapacity}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
          />
          <Button
            mode="contained"
            onPress={submitRoom}
            loading={isSubmitting}
            style={styles.button}
          >
            {t("common.save")}
          </Button>
        </Card.Content>
      </Card>

      {rooms.map((room) => {
        const occupied = occupancyFor(room.id);
        const left = Math.max(0, room.capacity - occupied);
        const full = occupied >= room.capacity;
        return (
          <Pressable
            key={room.id}
            onPress={() =>
              router.push(`/(app)/hostel/rooms/${room.id}` as never)
            }
          >
            <Card mode="outlined" style={styles.card}>
              <Card.Content>
                <View style={styles.roomRow}>
                  <View style={styles.roomInfo}>
                    <Text variant="titleMedium">{room.name}</Text>
                    <Text variant="bodySmall">
                      {`${t("hostel.occupied")}: ${occupied} / ${room.capacity}`}
                    </Text>
                  </View>
                  <Chip mode={full ? "flat" : "outlined"}>
                    {full
                      ? t("hostel.full")
                      : `${t("hostel.occupancyLeft")}: ${left}`}
                  </Chip>
                </View>
              </Card.Content>
            </Card>
          </Pressable>
        );
      })}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12 },
  input: { marginTop: 12 },
  button: { marginTop: 12 },
  roomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  roomInfo: { flex: 1, gap: 2 },
});
