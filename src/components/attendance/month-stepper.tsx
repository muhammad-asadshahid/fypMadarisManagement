import dayjs from "dayjs";
import { StyleSheet, View } from "react-native";
import { IconButton, Text } from "react-native-paper";

import { monthLabel } from "@/lib/months";

interface MonthStepperProps {
  value: string;
  onChange: (month: string) => void;
}

/** Steps a `YYYY-MM` value a month at a time, capped at the current month. */
export function MonthStepper({ value, onChange }: MonthStepperProps) {
  const current = dayjs(`${value}-01`);
  const atCurrentMonth = value >= dayjs().format("YYYY-MM");

  return (
    <View style={styles.row}>
      <IconButton
        icon="chevron-left"
        onPress={() => onChange(current.subtract(1, "month").format("YYYY-MM"))}
      />
      <Text variant="titleMedium" style={styles.label}>
        {monthLabel(value)}
      </Text>
      <IconButton
        icon="chevron-right"
        disabled={atCurrentMonth}
        onPress={() => onChange(current.add(1, "month").format("YYYY-MM"))}
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
  label: {
    flex: 1,
    textAlign: "center",
  },
});
