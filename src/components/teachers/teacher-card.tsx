import type { Teacher } from "@/types";
import { router } from "expo-router";
import { StyleSheet } from "react-native";
import { Card, Text } from "react-native-paper";

export function TeacherCard({ teacher }: { teacher: Teacher }) {
  return (
    <Card
      mode="elevated"
      style={styles.card}
      onPress={() => router.push(`/(app)/teachers/${teacher.id}` as never)}
    >
      <Card.Content>
        <Text variant="titleMedium">{teacher.name}</Text>
        {teacher.email ? (
          <Text variant="bodySmall">{teacher.email}</Text>
        ) : null}
        <Text variant="bodySmall">{teacher.subjects?.join(", ")}</Text>
        <Text variant="bodySmall">{teacher.contactNumber}</Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({ card: { marginBottom: 8 } });
