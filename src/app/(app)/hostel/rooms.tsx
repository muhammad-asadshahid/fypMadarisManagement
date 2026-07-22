import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";
import { Button, Card, Text, TextInput } from "react-native-paper";

import { ScreenWrapper } from "@/components/common/screen-wrapper";
import { hostelService } from "@/modules/hostel/service";
import type { Room } from "@/types";

export default function HostelRoomsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    hostelService.getRooms().then(setRooms);
  }, []);

  const submitRoom = async () => {
    if (!name || !capacity) return;
    setIsSubmitting(true);
    try {
      const room = await hostelService.createRoom({
        name,
        capacity: Number(capacity),
      });
      setRooms((prev) => [room, ...prev]);
      setName("");
      setCapacity("");
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

      {rooms.map((room) => (
        <Card key={room.id} mode="outlined" style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">{room.name}</Text>
            <Text>
              {t("hostel.capacity")} : {room.capacity}
            </Text>
          </Card.Content>
        </Card>
      ))}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12 },
  input: { marginTop: 12 },
  button: { marginTop: 12 },
});
