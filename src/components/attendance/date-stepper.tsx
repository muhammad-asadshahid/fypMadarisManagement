import dayjs from "dayjs";
import { StyleSheet, View } from "react-native";
import { Button, IconButton, Text } from "react-native-paper";

interface DateStepperProps {
  value: string;
  onChange: (date: string) => void;
  todayLabel: string;
}

/** Steps a `YYYY-MM-DD` value a day at a time, capped at today. */
export function DateStepper({ value, onChange, todayLabel }: DateStepperProps) {
  const today = dayjs().startOf("day");
  const current = dayjs(value);
  const atToday = !current.isBefore(today, "day");

  return (
    <View style={styles.row}>
      <IconButton
        icon="chevron-left"
        onPress={() => onChange(current.subtract(1, "day").format("YYYY-MM-DD"))}
      />
      <View style={styles.center}>
        <Text variant="titleMedium">{current.format("DD MMM YYYY")}</Text>
        <Button
          compact
          mode="text"
          disabled={atToday}
          onPress={() => onChange(today.format("YYYY-MM-DD"))}
        >
          {todayLabel}
        </Button>
      </View>
      <IconButton
        icon="chevron-right"
        disabled={atToday}
        onPress={() => onChange(current.add(1, "day").format("YYYY-MM-DD"))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  center: {
    flex: 1,
    alignItems: "center",
  },
});
